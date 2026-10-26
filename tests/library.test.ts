// 0.2.0 skill library tests: 73-workflow catalog, skills, and scenario fixture.
// Verifies the typed catalog matches skills/*/SKILL.md frontmatter, every
// workflow carries complete meaningful examples, and the 387-case fixture
// covers each workflow plus cross-workflow review prompts (all NOT_RUN).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LIBRARY_VERSION,
  WORKFLOW_CATALOG,
  WORKFLOW_NAMES,
  getWorkflowEntry,
  isWorkflowName,
} from '../src/workflows/catalog.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const PRESERVED12 = [
  'daily-close-review',
  'data-reconciliation',
  'menu-margin-review',
  'onboarding',
  'ordering-proposals',
  'prep-planning',
  'purchase-price-review',
  'recipe-costing',
  'recipe-documentation',
  'recipe-scaling',
  'sop-drafting',
  'waste-review',
];

const NO_COVERAGE12 = [
  'onboarding',
  'data-reconciliation',
  'recipe-scaling',
  'purchase-price-review',
  'invoice-reconciliation',
  'usable-yield-verification',
  'supplier-substitution-review',
  'capacity-aware-prep',
  'food-truck-event-profitability',
  'catering-quotation',
  'stock-variance',
  'recipe-dependency-impact',
];

const BASELINE_MAP: Record<string, string> = {
  'recipe-bible-generator': 'recipe-documentation',
  'dish-costing-calculator': 'recipe-costing',
  'menu-engineering-analyser': 'menu-margin-review',
  'prep-list-generator': 'prep-planning',
  'ordering-checklist-tracker': 'ordering-proposals',
  'waste-tracker': 'waste-review',
  'kitchen-sop-generator': 'sop-drafting',
  'end-of-service-report': 'daily-close-review',
};

const ZONES = new Set([
  'Kitchen Operations',
  'Menu and Product Development',
  'People and Training',
  'Events and Banqueting',
  'Suppliers and Finance',
  'FOH and Guest Experience',
  'Wellbeing and Social Media',
  'Workspace',
  'Connected Workflows',
]);

const FIVE_CATS = [
  'happy-path',
  'missing-conflicting-data',
  'localization',
  'adversarial-source',
  'workflow-state-honesty',
];

interface SkillMeta {
  name: string;
  descriptionLine: string;
  version: string;
  license: string;
  body: string;
}

function parseSkill(text: string, id: string): SkillMeta {
  assert.ok(text.startsWith('---\n'), `${id} starts with YAML frontmatter`);
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, `${id} has YAML frontmatter block`);
  const head = m[1] as string;
  const body = m[2] as string;
  const line = (key: string): string => {
    const found = head.split('\n').find((l) => l.startsWith(`${key}:`));
    assert.ok(found, `${id} frontmatter has ${key}`);
    return (found as string).slice(key.length + 1).trim();
  };
  return { name: line('name'), descriptionLine: line('description'), version: line('version'), license: line('license'), body };
}

describe('library catalog', () => {
  it('lists exactly 73 distinct workflows', () => {
    assert.equal(LIBRARY_VERSION, '0.2.0');
    assert.equal(WORKFLOW_CATALOG.length, 73);
    const ids = WORKFLOW_CATALOG.map((w) => w.id);
    assert.equal(new Set(ids).size, 73);
    assert.deepEqual([...WORKFLOW_NAMES], [...WORKFLOW_NAMES].sort());
    assert.equal(WORKFLOW_NAMES.length, 73);
    assert.deepEqual([...ids].sort(), [...WORKFLOW_NAMES].sort());
    for (const w of WORKFLOW_CATALOG) {
      assert.ok(w.title.length > 0, `${w.id} title`);
      assert.ok(w.summary.length > 20, `${w.id} summary`);
      assert.ok(ZONES.has(w.zone), `${w.id} zone ${w.zone}`);
      assert.ok(w.inputs.length > 0, `${w.id} inputs`);
      assert.ok(w.outputs.length > 0, `${w.id} outputs`);
      assert.ok(w.tools.length > 0, `${w.id} tools`);
    }
  });

  it('covers 61 unique baseline ids and preserves all 12 existing ids', () => {
    const ids = new Set(WORKFLOW_CATALOG.map((w) => w.id));
    for (const p of PRESERVED12) assert.ok(ids.has(p), `preserved ${p}`);
    const covered = WORKFLOW_CATALOG.filter((w) => w.coverageId).map((w) => w.coverageId as string);
    assert.equal(covered.length, 61);
    assert.equal(new Set(covered).size, 61);
    const noCov = WORKFLOW_CATALOG.filter((w) => !w.coverageId).map((w) => w.id).sort();
    assert.deepEqual(noCov, [...NO_COVERAGE12].sort());
    for (const [base, canon] of Object.entries(BASELINE_MAP)) {
      const w = getWorkflowEntry(canon);
      assert.equal(w.coverageId, base);
      assert.ok(w.aliases.includes(base), `${canon} aliases include ${base}`);
    }
  });

  it('keeps aliases unique with no alias equal to a canonical id', () => {
    const ids = new Set(WORKFLOW_CATALOG.map((w) => w.id));
    const aliases = WORKFLOW_CATALOG.flatMap((w) => w.aliases);
    assert.equal(new Set(aliases).size, aliases.length);
    for (const a of aliases) assert.ok(!ids.has(a), `alias ${a} is not a canonical id`);
    for (const w of WORKFLOW_CATALOG) {
      if (w.coverageId && w.coverageId !== w.id) {
        assert.ok(w.aliases.includes(w.coverageId), `${w.id} aliases include baseline ${w.coverageId}`);
      }
    }
  });

  it('resolves entries by id or alias and rejects unknown workflows', () => {
    for (const w of WORKFLOW_CATALOG) {
      assert.equal(getWorkflowEntry(w.id).id, w.id);
      assert.equal(isWorkflowName(w.id), true);
      for (const a of w.aliases) assert.equal(getWorkflowEntry(a).id, w.id);
    }
    assert.equal(isWorkflowName('no-such-workflow'), false);
    assert.throws(() => getWorkflowEntry('no-such-workflow'), /unknown workflow/);
  });

  it('carries complete meaningful catalog examples', () => {
    for (const w of WORKFLOW_CATALOG) {
      assert.ok(w.example.input.length > 40, `${w.id} example input`);
      assert.ok(w.example.output.length > 100, `${w.id} example output`);
      assert.ok(w.blockedExample.input.length > 20, `${w.id} blocked input`);
      assert.ok(w.blockedExample.output.length > 60, `${w.id} blocked output`);
    }
  });
});

describe('library skills', () => {
  it('has exactly 73 skill directories matching the catalog', () => {
    const dirs = readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    assert.deepEqual(dirs, [...WORKFLOW_NAMES].sort());
  });

  it('each skill has valid frontmatter and the required structure', () => {
    const sections = [
      '## Purpose',
      '## Required inputs',
      '## Execution steps',
      '## Output template',
      '## Missing / conflicting data',
      '## Tool availability / connection boundary',
      '## Approval',
      '## Worked example',
      '## Blocked example',
    ];
    for (const w of WORKFLOW_CATALOG) {
      const text = readFileSync(join(ROOT, `skills/${w.id}/SKILL.md`), 'utf8');
      const meta = parseSkill(text, w.id);
      assert.equal(meta.name, w.id);
      assert.ok(
        meta.descriptionLine.startsWith('"') && meta.descriptionLine.endsWith('"'),
        `${w.id} description is quoted`,
      );
      assert.equal(meta.version, '0.2.0');
      assert.equal(meta.license, 'MIT');
      for (const s of sections) assert.ok(meta.body.includes(s), `${w.id} has ${s}`);
      assert.ok(meta.body.toLowerCase().includes('original mit'), `${w.id} marked original MIT`);
      const lower = text.toLowerCase();
      assert.ok(!lower.includes('axomai'), `${w.id} has no Axomai content`);
      assert.ok(!lower.includes('cheezies'), `${w.id} has no Cheezies content`);
    }
  });

  it('each skill teaches unknown allergen states and gives full examples', () => {
    for (const w of WORKFLOW_CATALOG) {
      const text = readFileSync(join(ROOT, `skills/${w.id}/SKILL.md`), 'utf8');
      const meta = parseSkill(text, w.id);
      assert.ok(meta.body.includes('verified_absent'), `${w.id} names verified_absent`);
      assert.ok(meta.body.includes('may_contain'), `${w.id} names may_contain`);
      assert.ok(meta.body.includes('unknown'), `${w.id} names unknown allergen state`);
      const worked = meta.body.split('## Worked example')[1].split('## Blocked example')[0];
      const blocked = meta.body.split('## Blocked example')[1];
      assert.ok(worked.length > 300, `${w.id} worked example is full`);
      assert.ok(blocked.length > 100, `${w.id} blocked example is full`);
      assert.ok(
        blocked.includes('unknown') || blocked.includes('TBC'),
        `${w.id} blocked example marks unknowns`,
      );
    }
  });
});

interface FixtureScenario {
  id: string;
  workflowId: string;
  category: string;
  prompt: string;
  expectedChecks: string[];
  severity: string;
  executionStatus: string;
}

describe('library grounding', () => {
  function skillExamples(id: string): { wIn: string; wOut: string; bIn: string; bOut: string } {
    const text = readFileSync(join(ROOT, `skills/${id}/SKILL.md`), 'utf8');
    const worked = text.split('## Worked example')[1].split('## Blocked example')[0];
    const blocked = text.split('## Blocked example')[1];
    const wIn = (worked.match(/\*\*Input:\*\* (.*)/) || [])[1];
    const bIn = (blocked.match(/\*\*Input:\*\* (.*)/) || [])[1];
    assert.ok(wIn !== undefined, `${id} worked Input line`);
    assert.ok(bIn !== undefined, `${id} blocked Input line`);
    const wOut = worked.split('```')[1].replace(/^\n/, '').replace(/\n$/, '');
    const bOut = blocked.split('```')[1].replace(/^\n/, '').replace(/\n$/, '');
    return { wIn: (wIn as string).trim(), wOut, bIn: (bIn as string).trim(), bOut };
  }

  it('keeps catalog examples exactly consistent with SKILL.md sections', () => {
    for (const w of WORKFLOW_CATALOG) {
      const s = skillExamples(w.id);
      assert.equal(s.wIn, w.example.input, `${w.id} worked input`);
      assert.equal(s.wOut, w.example.output, `${w.id} worked output`);
      assert.equal(s.bIn, w.blockedExample.input, `${w.id} blocked input`);
      assert.equal(s.bOut, w.blockedExample.output, `${w.id} blocked output`);
    }
  });

  it('uses the relevant-settings-only rule and never the blanket every-run demand', () => {
    for (const w of WORKFLOW_CATALOG) {
      const text = readFileSync(join(ROOT, `skills/${w.id}/SKILL.md`), 'utf8');
      assert.ok(!text.includes('explicit operator inputs on every run'), `${w.id} no blanket demand`);
      assert.ok(text.includes('never forced where irrelevant'), `${w.id} relevant-settings-only rule`);
    }
  });

  it('removes the blanket locale line on unrelated HR and wellbeing tasks', () => {
    const drop = [
      'agency-chef-onboarding-generator',
      'apprenticeship-tracker',
      'burnout-stress-risk-assessment',
      'chef-personal-brand-builder',
      'chef-wellbeing-check-in',
      'disciplinary-documentation-helper',
      'guest-feedback-analyser',
      'kitchen-culture-health-check',
      'kitchen-ethos-doc-generator',
      'plate-photography-brief',
      'social-media-content-generator',
      'staff-performance-review',
      'team-meeting-agenda-builder',
      'training-plan-generator',
      'trial-shift-assessment',
      'vip-special-guest-brief',
    ];
    assert.equal(drop.length, 16);
    for (const id of drop) {
      const text = readFileSync(join(ROOT, `skills/${id}/SKILL.md`), 'utf8');
      assert.ok(
        !text.includes('- Locale context: site, currency code, units, timezone, and commercial target, all explicit.'),
        `${id} no blanket locale line`,
      );
    }
    const keep = readFileSync(join(ROOT, 'skills/menu-margin-review/SKILL.md'), 'utf8');
    assert.ok(keep.includes('- Locale context:'), 'menu-margin-review keeps locale context');
  });

  it('carries no known invented worked-output claims', () => {
    const banned = [
      '21 plus per local law',
      '21 plus only per local law',
      '3 percent est',
      'Bio short 50 words',
      'Packaging: 0c',
    ];
    for (const w of WORKFLOW_CATALOG) {
      for (const b of banned) {
        assert.ok(!w.example.output.includes(b), `${w.id} output bans ${b}`);
      }
    }
  });
});

describe('example reviews', () => {
  it('holds exactly 73 specific review rows matching the catalog', () => {
    const raw = readFileSync(join(ROOT, 'fixtures', 'workflow-example-reviews.json'), 'utf8');
    const doc = JSON.parse(raw);
    assert.equal(doc.version, '0.2.0');
    assert.equal(doc.host, 'Muse CLI reference-host editorial review; model identity not independently verified');
    assert.ok(typeof doc.scope === 'string' && doc.scope.length > 10, 'scope states review bounds');
    assert.equal(doc.reviews.length, 73);
    const ids = doc.reviews.map((r: { workflowId: string }) => r.workflowId);
    assert.deepEqual([...ids].sort(), [...WORKFLOW_NAMES].sort());
    const seen = new Set<string>();
    for (const r of doc.reviews) {
      for (const k of ['worked', 'blocked'] as const) {
        assert.ok(r[k].status === 'PASS' || r[k].status === 'FAIL', `${r.workflowId} ${k} status`);
        assert.ok(
          typeof r[k].evidence === 'string' && r[k].evidence.length > 40,
          `${r.workflowId} ${k} evidence specific`,
        );
        assert.ok(!seen.has(r[k].evidence), `${r.workflowId} ${k} evidence not a repeated generic string`);
        seen.add(r[k].evidence);
      }
      assert.ok(Array.isArray(r.corrections), `${r.workflowId} corrections array`);
    }
  });
});

describe('library scenarios', () => {
  function load(): { raw: string; doc: { version: number; scenarios: FixtureScenario[] } } {
    const raw = readFileSync(join(ROOT, 'fixtures', 'workflow-scenarios.json'), 'utf8');
    return { raw, doc: JSON.parse(raw) };
  }

  it('fixture holds exactly 387 NOT_RUN cases with five per workflow plus 22 cross', () => {
    const { raw, doc } = load();
    assert.equal(doc.version, 1);
    assert.equal(doc.scenarios.length, 387);
    const ids = doc.scenarios.map((s) => s.id);
    assert.equal(new Set(ids).size, 387);
    assert.deepEqual(ids, [...ids].sort());
    for (const s of doc.scenarios) {
      assert.ok(s.prompt.length >= 40, `${s.id} prompt`);
      assert.ok(Array.isArray(s.expectedChecks) && s.expectedChecks.length >= 3, `${s.id} checks`);
      assert.equal(s.executionStatus, 'NOT_RUN');
    }
    for (const w of WORKFLOW_CATALOG) {
      const got = doc.scenarios.filter((s) => s.workflowId === w.id).map((s) => s.category).sort();
      assert.deepEqual(got, [...FIVE_CATS].sort(), `${w.id} five categories`);
    }
    const cross = doc.scenarios.filter((s) => s.workflowId === 'cross-workflow');
    assert.equal(cross.length, 22);
    for (const s of cross) assert.equal(s.category, 'cross-workflow');
    const lower = raw.toLowerCase();
    assert.ok(!lower.includes('axomai'));
    assert.ok(!lower.includes('cheezies'));
    assert.ok(!lower.includes('model execution'));
  });
});
