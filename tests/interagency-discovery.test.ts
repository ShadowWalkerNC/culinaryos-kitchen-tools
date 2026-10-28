// Interagency 0.3 journey/discovery tests: 24 starters, pack/audience/goal filters,
// honest stateless progress, and pack coverage that stays valid after catalog expansion.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS, getStarted} from '../src/workflows/getStarted.js';
import {listWorkflows, workflowGuidance} from '../src/workflows/discovery.js';
import {WORKFLOW_CATALOG} from '../src/workflows/catalog.js';
import {
  PACK_IDS, WORKFLOW_PACKS, PACK_CORE_IDS, EXPECTED_NEW_WORKFLOW_IDS,
  INTERAGENCY_CALCULATOR_TOOLS, allPackWorkflowIds, packIdForWorkflow,
} from '../src/workflows/packs.js';
import {PUBLIC_TOOL_NAMES} from '../src/mcp/publicTools.js';
import {LOCAL_TOOL_NAMES} from '../src/mcp/localTools.js';

const CATALOG_IDS = new Set(WORKFLOW_CATALOG.map(w => w.id));
const EXPANDED_IDS = new Set([...CATALOG_IDS, ...EXPECTED_NEW_WORKFLOW_IDS]);
const KNOWN_TOOLS = new Set([...PUBLIC_TOOL_NAMES, ...LOCAL_TOOL_NAMES, ...INTERAGENCY_CALCULATOR_TOOLS]);

const EXPECTED_ORDER = [
  'menu-cost', 'recipe-library', 'convert-recipe', 'truck-event', 'bakery-day', 'care-menu',
  'home-week', 'service', 'bar', 'shop', 'catering', 'marketing',
  'daily-open', 'daily-close', 'supplier-change', 'delivery-margin', 'recall-drill',
  'home-cookalong', 'bakery-proofing', 'bar-batching', 'event-application',
  'team-training', 'campaign-review', 'care-paperwork',
];

describe('interagency journeys: 24 stable unique starters', () => {
  it('lists exactly the 24 expected starters in stable order', () => {
    assert.equal(STARTERS.length, 24);
    assert.deepEqual(STARTERS.map(s => s.id), EXPECTED_ORDER);
    assert.equal(new Set(STARTERS.map(s => s.id)).size, 24);
  });
  it('gives every starter four steps, a prompt, workflows, audience and pack', () => {
    for (const s of STARTERS) {
      assert.equal(s.steps.length, 4, `${s.id} steps`);
      for (const step of s.steps) assert.ok(step.length > 20, `${s.id} step text`);
      assert.ok(s.title.length > 0 && s.audience.length > 0, `${s.id} meta`);
      assert.ok(s.prompt.length > s.title.length + 50, `${s.id} prompt`);
      assert.ok(s.workflowIds.length >= 2, `${s.id} workflows`);
      assert.ok(PACK_IDS.includes(s.pack!), `${s.id} pack ${s.pack}`);
    }
  });
  it('keeps defaults: 24 starters with prior fields when no filters are given', () => {
    const guide = getStarted();
    assert.equal(guide.starters.length, 24);
    assert.equal(guide.selected, null);
    assert.equal(guide.progress, null);
    assert.deepEqual(guide.suggestions, []);
    assert.equal(guide.matchNote, null);
    assert.equal(guide.nextAction, null);
    assert.deepEqual(guide.missingInputs, []);
    assert.deepEqual(guide.requiredTools, []);
    assert.ok(guide.introduction.length > 0 && guide.fallback.length > 0);
    assert.equal(guide.boundaries.length, 5);
  });
});

describe('interagency journeys: legacy contracts preserved', () => {
  it('keeps the original 12 starter IDs, fields and prompt behavior', () => {
    const byId = new Map(STARTERS.map(s => [s.id, s]));
    for (const id of EXPECTED_ORDER.slice(0, 12)) assert.ok(byId.has(id), id);
    assert.deepEqual(byId.get('menu-cost')!.workflowIds, ['data-reconciliation', 'recipe-costing', 'menu-margin-review']);
    assert.match(byId.get('care-menu')!.prompt, /Do not infer/);
    for (const s of STARTERS) {
      assert.match(s.prompt, /Guide me one step at a time/);
      assert.match(s.prompt, /Do not claim anything was saved or sent without a successful tool result/);
    }
  });
  it('keeps completedSteps user-reported, stateless and honest', () => {
    const guide = getStarted({starterId: 'menu-cost', completedSteps: [1, 1, 2]});
    assert.deepEqual(guide.progress?.reportedCompletedSteps, [1, 2]);
    assert.equal(guide.progress?.nextStep, 3);
    assert.equal(guide.progress?.persisted, false);
    assert.equal(getStarted({starterId: 'menu-cost', completedSteps: [1, 2, 3, 4]}).progress?.status, 'reported_complete');
    assert.equal(getStarted({starterId: 'menu-cost'}).progress?.nextStep, 1);
    assert.deepEqual(Object.keys(guide.progress ?? {}).sort(), ['nextStep', 'persisted', 'reportedCompletedSteps', 'status']);
    assert.throws(() => getStarted({starterId: 'invented'}), /UNKNOWN_STARTER/);
    assert.throws(() => getStarted({completedSteps: [1]}), /Choose a starter/);
  });
  it('brands CulinaryOS Intelligence while recognizing the Open Kitchen Toolkit alias', () => {
    const guide = getStarted();
    assert.match(guide.introduction, /CulinaryOS Intelligence/);
    assert.match(guide.introduction, /Open Kitchen Toolkit/);
    assert.match(guide.boundaries.join(' '), /CulinaryOS Intelligence/);
    assert.match(guide.boundaries.join(' '), /resident records/);
  });
});

describe('interagency journeys: pack, audience and goal filters', () => {
  it('filters starters by pack', () => {
    const guide = getStarted({pack: 'care'});
    assert.deepEqual(guide.starters.map(s => s.id).sort(), ['care-menu', 'care-paperwork']);
    for (const s of guide.starters) assert.equal(s.pack, 'care');
  });
  it('filters starters by audience substring and returns empty explicit results', () => {
    const guide = getStarted({audience: 'care kitchen'});
    assert.ok(guide.starters.length >= 2);
    for (const s of guide.starters) assert.match(s.audience.toLowerCase(), /care kitchen/);
    const empty = getStarted({audience: 'no-such-audience-xyz'});
    assert.deepEqual(empty.starters, []);
    assert.ok(empty.matchNote && empty.matchNote.length > 0);
  });
  it('rejects unknown packs with a schema error instead of returning all', () => {
    assert.throws(() => getStarted({pack: 'no-such-pack'}));
    assert.throws(() => listWorkflows({pack: 'no-such-pack'}));
  });
  it('matches goals with deterministic word matches and no calibrated confidence', () => {
    const a = getStarted({goal: 'delivery app fees'});
    assert.equal(a.suggestions[0]?.id, 'delivery-margin');
    assert.deepEqual(a.suggestions[0]?.matchedTokens, ['delivery', 'app', 'fees']);
    assert.ok(a.starters.some(s => s.id === 'delivery-margin'));
    for (const m of a.suggestions) assert.deepEqual(Object.keys(m).sort(), ['id', 'matchedTokens', 'title']);
    assert.deepEqual(a, getStarted({goal: 'delivery app fees'}));
    assert.ok(!JSON.stringify(a).includes('confidence'));
  });
  it('explains unmatched goals and falls back to the regular AI', () => {
    const guide = getStarted({goal: 'quantum rocket surgery'});
    assert.deepEqual(guide.starters, []);
    assert.deepEqual(guide.suggestions, []);
    assert.match(guide.matchNote ?? '', /No starter matched/);
    assert.match(guide.matchNote ?? '', /not AI understanding/);
    assert.match(guide.fallback, /regular AI/);
    assert.match(guide.fallback, /not installed/);
  });
});

describe('interagency journeys: selected-starter guidance', () => {
  it('reports nextAction, missingInputs and requiredTools without executing anything', () => {
    const first = getStarted({starterId: 'delivery-margin'});
    assert.equal(first.nextAction, first.selected!.steps[0]);
    assert.ok(first.missingInputs.length > 0);
    for (const t of first.requiredTools) assert.ok(KNOWN_TOOLS.has(t), `known tool ${t}`);
    assert.deepEqual(first.pendingWorkflows, first.selected!.workflowIds.filter(id => !CATALOG_IDS.has(id)));
    const mid = getStarted({starterId: 'delivery-margin', completedSteps: [1, 2]});
    assert.equal(mid.nextAction, mid.selected!.steps[2]);
    const done = getStarted({starterId: 'delivery-margin', completedSteps: [1, 2, 3, 4]});
    assert.equal(done.nextAction, null);
    assert.equal(done.progress?.status, 'reported_complete');
    assert.ok(!('executed' in first) && !('saved' in first));
  });
  it('keeps care paperwork on approved tools, privacy review and drafts only', () => {
    const s = STARTERS.find(x => x.id === 'care-paperwork')!;
    assert.deepEqual(s.workflowIds, ['approved-diet-menu-screen', 'dietary-requirements-tracker', 'recipe-compliance-checker', 'onboarding']);
    const text = s.steps.join(' ');
    assert.match(text, /Ross Manor/);
    assert.match(text, /menu_import/);
    assert.match(text, /menu_readiness/);
    assert.match(text, /drafts and reminders only/);
    assert.match(text, /resident-identifying/);
    assert.match(s.prompt, /Do not use resident names/);
  });
});

describe('interagency packs: exact 32 core plus sensible coverage to 118', () => {
  it('defines eight packs with the exact 32 core IDs', () => {
    assert.equal(WORKFLOW_PACKS.length, 8);
    assert.deepEqual(WORKFLOW_PACKS.map(p => p.id), [...PACK_IDS]);
    const core = Object.values(PACK_CORE_IDS).flat();
    assert.equal(core.length, 32);
    assert.equal(new Set(core).size, 32);
    assert.deepEqual(PACK_CORE_IDS.care, ['approved-diet-menu-screen', 'dietary-requirements-tracker', 'recipe-compliance-checker', 'onboarding']);
    assert.deepEqual(PACK_CORE_IDS.operations, ['product-recall-trace-drill', 'recipe-dependency-impact', 'stock-variance', 'menu-margin-review']);
  });
  it('covers the growing catalog plus all 13 expected IDs exactly once', () => {
    assert.equal(EXPECTED_NEW_WORKFLOW_IDS.length, 13);
    assert.ok(CATALOG_IDS.size >= 105 && CATALOG_IDS.size <= 118, `catalog size ${CATALOG_IDS.size}`);
    const all = allPackWorkflowIds();
    assert.equal(all.length, 118);
    assert.equal(new Set(all).size, 118);
    for (const id of CATALOG_IDS) assert.ok(all.includes(id), `pack covers ${id}`);
    for (const id of EXPECTED_NEW_WORKFLOW_IDS) assert.ok(all.includes(id), `pack covers new ${id}`);
    for (const id of CATALOG_IDS) assert.ok(EXPANDED_IDS.has(id), `catalog id ${id} is known`);
  });
  it('keeps starter workflow references valid after the catalog expands', () => {
    for (const s of STARTERS) {
      for (const id of s.workflowIds) assert.ok(EXPANDED_IDS.has(id), `${s.id} references ${id}`);
      assert.ok(s.workflowIds.some(id => CATALOG_IDS.has(id)), `${s.id} has a currently available workflow`);
      for (const id of s.workflowIds) assert.ok(packIdForWorkflow(id), `${id} has a pack`);
    }
    for (const id of EXPECTED_NEW_WORKFLOW_IDS) {
      assert.ok(STARTERS.some(s => s.workflowIds.includes(id as string)), `new workflow ${id} is reachable from a starter`);
    }
  });
});

describe('interagency discovery: pack and audience metadata', () => {
  it('keeps list_workflows pagination and fields while adding pack metadata', () => {
    const page = listWorkflows({});
    assert.equal(page.total, WORKFLOW_CATALOG.length);
    assert.equal(page.offset, 0);
    assert.equal(page.nextOffset, page.total > 20 ? 20 : null);
    for (const item of page.items) {
      for (const k of ['id', 'title', 'zone', 'summary', 'aliases', 'inputs', 'outputs', 'tools']) assert.ok(k in item, k);
      assert.ok(!('example' in item) && !('blockedExample' in item));
      assert.ok(typeof item.pack === 'string' && typeof item.audience === 'string');
    }
    assert.equal(listWorkflows({query: 'mom and pop', limit: 100}).total, 6);
  });
  it('filters list_workflows by pack with pagination intact', () => {
    for (const pack of WORKFLOW_PACKS) {
      const expected = pack.workflowIds.filter(id => CATALOG_IDS.has(id)).length;
      const got = listWorkflows({pack: pack.id, limit: 100});
      assert.equal(got.total, expected, `pack ${pack.id}`);
      for (const item of got.items) assert.equal(item.pack, pack.id);
    }
    const ops = WORKFLOW_PACKS.find(p => p.id === 'operations')!;
    const opsTotal = ops.workflowIds.filter(id => CATALOG_IDS.has(id)).length;
    const page = listWorkflows({pack: 'operations', limit: 5});
    assert.equal(page.total, opsTotal);
    assert.equal(page.nextOffset, opsTotal > 5 ? 5 : null);
  });
  it('filters list_workflows by audience with explicit empty results', () => {
    const home = listWorkflows({audience: 'Home Kitchen', limit: 100});
    const homePack = WORKFLOW_PACKS.find(p => p.id === 'home')!;
    assert.equal(home.total, homePack.workflowIds.filter(id => CATALOG_IDS.has(id)).length);
    for (const item of home.items) assert.equal(item.pack, 'home');
    const empty = listWorkflows({audience: 'no-such-audience-xyz'});
    assert.equal(empty.total, 0);
    assert.deepEqual(empty.items, []);
    assert.equal(empty.nextOffset, null);
  });
  it('keeps get_workflow fields and adds pack and audience metadata', () => {
    const w = workflowGuidance({name: 'menu-margin-review'});
    assert.equal(w.id, 'menu-margin-review');
    assert.equal(w.pack, 'operations');
    assert.equal(w.audience, 'Restaurant / professional kitchen');
    assert.ok(typeof w.instructions === 'string' && w.instructions.includes('Worked example'));
    assert.ok(Array.isArray(w.steps) && w.steps.length > 0);
    assert.ok(typeof w.approvals === 'string' && typeof w.connection === 'string');
    const alias = workflowGuidance({name: 'menu-engineering-analyser'});
    assert.equal(alias.id, 'menu-margin-review');
    assert.equal(alias.pack, 'operations');
    assert.throws(() => workflowGuidance({name: 'no-such-workflow'}), /UNKNOWN_WORKFLOW/);
  });
});
