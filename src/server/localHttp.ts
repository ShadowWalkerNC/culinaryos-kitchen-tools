// F14 local HTTP: 127.0.0.1, built UI, session-secret mutations, strict checks.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import { openDb, type Db } from '../data/db.js';
import { previewImport, commitImport } from '../data/imports.js';
import { createTask, listTasks, setTaskState, requestApproval, decideApproval, listApprovals } from '../data/tasks.js';
import { getRecipe, listRecipes, latestPurchaseByIngredient, allRecipes } from '../data/queries.js';
import { exportJson, exportRecipeCards, exportCostSheets } from '../data/exports.js';
import { costRecipe } from '../core/costing.js';
import { getWorkflowsConfig, setWorkflowsConfig } from '../mcp/localTools.js';
import { forecastSchema } from '../mcp/schemas.js';
import { saveForecast, workerTick } from '../jobs/worker.js';
import { systemClock } from '../jobs/clocks.js';
import { handleMcpStreamable } from '../mcp/httpStream.js';
import { checkHost, checkOrigin, createSessionStore, readBodyCapped, createCalcRunner, logMeta } from './security.js';
import {VERSION} from '../version.js';
import {startWorkspaceWorker,workerStatus} from '../jobs/workspaceWorker.js';
import {runConnectedFlow,listConnectedFlows,attachFlowDocument,approveFlow} from '../workflows/connected.js';
import {getRestaurantProfile,setRestaurantProfile} from '../workflows/profile.js';
import {listWorkflows,workflowGuidance} from '../workflows/discovery.js';
import {loadEventDraft,saveEventDraft,previewEventDraft,createEventFromDraft} from '../workflows/eventDraft.js';
import {setupStatus,checkHostedConnection} from '../workflows/setup.js';
import {ZodError} from 'zod';
import {printableFlowDocument} from '../workflows/printDocument.js';

const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

export interface LocalServerOpts {
  port: number;
  workspaceRoot: string;
  uiDir: string;
  dev?: boolean;
}

export interface LocalHandlerDeps {
  db: Db;
  workspaceRoot: string;
  uiDir: string;
  port: number;
  sessions: ReturnType<typeof createSessionStore>;
  runCalc: ReturnType<typeof createCalcRunner>;
}

function sendJson(res: ServerResponse, status: number, body: unknown, type = 'application/json'): void {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'content-type': type, 'content-length': Buffer.byteLength(payload), 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'" });
  res.end(payload);
}

/** Exported for handler-level tests (no TCP needed). */
export function createLocalHandler(deps: LocalHandlerDeps): (req: IncomingMessage, res: ServerResponse) => void {
  const opts = deps;
  const { db, sessions, runCalc } = deps;
  const send: Send = sendJson;
  return (req, res) => {
    const started = Date.now();
    void (async () => {
      try {
        const url = new URL(req.url ?? '/', 'http://x');
        const path = url.pathname;
        if (!checkHost(req, opts.port)) {
          send(res, 403, { error: 'bad host' });
          return;
        }
        if (!checkOrigin(req, opts.port)) {
          send(res, 403, { error: 'bad origin' });
          return;
        }
        if (req.method === 'GET' && path === '/health') {
          send(res, 200, { ok: true });
          return;
        }
        if (req.method === 'GET' && path === '/version') {
          send(res, 200, { version: VERSION, dataVersion: 'v1', mode: 'local' });
          return;
        }
        if (req.method === 'GET' && path === '/api/session') {
          // Exact same-origin issuance: browser must send Origin + same-origin fetch metadata.
          const origin = req.headers.origin;
          const sfs = req.headers['sec-fetch-site'];
          if (typeof origin === 'string' && origin !== '') {
            // origin already validated above; require fetch metadata for browser flows
            if (sfs !== 'same-origin' && sfs !== 'none') {
              send(res, 403, { error: 'fetch metadata required' });
              return;
            }
          }
          send(res, 200, { token: sessions.token });
          return;
        }
        // Mutations require session token.
        const needsToken = req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS' && (path.startsWith('/api/') || path === '/mcp');
        if (needsToken && !sessions.verify(req.headers['x-session-token'] as string | undefined)) {
          send(res, 401, { error: 'missing or invalid session token' });
          return;
        }
        if (path === '/mcp') {
          const raw = await readBodyCapped(req);
          const parsed = raw.length > 0 ? (JSON.parse(raw.toString('utf8') || 'null') as unknown) : undefined;
          await handleMcpStreamable(req, res, 'local', { db, workspaceRoot: opts.workspaceRoot }, parsed);
          return;
        }
        if (path.startsWith('/api/')) {
          await handleApi(req, res, path, db, opts.workspaceRoot, runCalc, send);
          return;
        }
        // Static UI
        serveUi(req, res, path, opts.uiDir, send);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg === 'BODY_TOO_LARGE') send(res, 413, { error: 'request too large (1MB max)' });
        else if (msg === 'CALC_TIMEOUT') send(res, 503, { error: 'calculation timeout' });
        else if (msg.startsWith('STALE_VERSION')) send(res, 409, { error: msg });
        else send(res, 400, { error: e instanceof ZodError?e.issues.map(i=>i.path.join('.')+': '+i.message).join('; '):msg });
      } finally {
        logMeta(req.method, req.url, res.statusCode, Date.now() - started);
      }
    })();
  };
}

export function startLocalServer(opts: LocalServerOpts): { close(): Promise<void>; port: number; ready: Promise<boolean> } {
  const db: Db = openDb(join(opts.workspaceRoot, 'kitchen-tools.sqlite'));
  const sessions = createSessionStore(opts.workspaceRoot);
  const runCalc = createCalcRunner();
  const server = createServer(createLocalHandler({ db, workspaceRoot: opts.workspaceRoot, uiDir: opts.uiDir, port: opts.port, sessions, runCalc }));
  server.on('error', (e: Error) => {
    process.stderr.write(`local server error: ${e.message}\n`);
  });
  const ready = new Promise<boolean>((resolve) => {
    server.once('listening', () => resolve(true));
    server.once('error', () => resolve(false));
  });
  server.listen(opts.port, '127.0.0.1');
  let stopWorker=()=>{};
  server.once('listening',()=>{stopWorker=startWorkspaceWorker(db);});
  return {
    port: opts.port,
    ready,
    close: () =>
      new Promise<void>((resolveClose) => {
        stopWorker();
        server.close(() => {
          db.close();
          resolveClose();
        });
      }),
  };
}

type Send = (res: ServerResponse, status: number, body: unknown, type?: string) => void;

async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  db: Db,
  workspaceRoot: string,
  runCalc: <T>(fn: () => T | Promise<T>) => Promise<T>,
  send: Send,
): Promise<void> {
  const readJson = async (): Promise<Record<string, never>> => {
    const raw = await readBodyCapped(req);
    if (raw.length === 0) return {};
    return JSON.parse(raw.toString('utf8')) as Record<string, never>;
  };
  const printMatch=/^\/api\/flow-document\/([^/]+)\/([^/]+)$/.exec(path);
  if(req.method==='GET'&&printMatch){send(res,200,printableFlowDocument(db,decodeURIComponent(printMatch[1]!),decodeURIComponent(printMatch[2]!)),'text/html; charset=utf-8');return;}
  if(req.method==='GET'&&path==='/api/profile'){send(res,200,getRestaurantProfile(db));return;}
  if(req.method==='GET'&&path==='/api/setup'){send(res,200,setupStatus(db));return;}
  if(req.method==='POST'&&path==='/api/setup/check-hosted'){send(res,200,await runCalc(()=>checkHostedConnection()));return;}
  if(req.method==='GET'&&path==='/api/job-drafts/event'){send(res,200,loadEventDraft(db));return;}
  if(req.method==='POST'&&path==='/api/job-drafts/event'){send(res,200,saveEventDraft(db,await readJson()));return;}
  if(req.method==='POST'&&path==='/api/events/preview'){send(res,200,previewEventDraft(await readJson()));return;}
  if(req.method==='POST'&&path==='/api/events/create'){send(res,200,createEventFromDraft(db,await readJson()));return;}
  if(req.method==='POST'&&path==='/api/profile'){send(res,200,setRestaurantProfile(db,await readJson()));return;}
  if(req.method==='GET'&&path==='/api/worker-status'){send(res,200,workerStatus(db));return;}
  if(req.method==='GET'&&path==='/api/library'){send(res,200,listWorkflows({limit:100}));return;}
  if(req.method==='POST'&&path==='/api/library/workflow'){send(res,200,workflowGuidance({...await readJson(),profile:getRestaurantProfile(db)}));return;}
  if(req.method==='GET'&&path==='/api/connected-flows'){send(res,200,listConnectedFlows(db));return;}
  if(req.method==='POST'&&path==='/api/connected-flows'){send(res,200,runConnectedFlow(db,await readJson()));return;}
  if(req.method==='POST'&&path==='/api/connected-flows/document'){send(res,200,attachFlowDocument(db,await readJson()));return;}
  if(req.method==='POST'&&path==='/api/connected-flows/approve'){send(res,200,approveFlow(db,await readJson()));return;}
  if(req.method==='GET'&&path==='/api/runs'){send(res,200,db.raw.prepare('SELECT schedule,occurrence,status,input,output,attempts,updated_at FROM runs ORDER BY updated_at DESC LIMIT 100').all());return;}
  if(req.method==='POST'&&path==='/api/workflows/run'){send(res,200,workerTick(db,systemClock()));return;}
  if(req.method==='POST'&&path==='/api/forecasts'){const b=forecastSchema.parse(await readJson());saveForecast(db,b.day,b.forecast,b.confirm,systemClock());send(res,200,{saved:b.day});return;}
  // Recipes
  if (req.method === 'GET' && path === '/api/recipes') {
    send(res, 200, listRecipes(db));
    return;
  }
  const recipeMatch = /^\/api\/recipes\/([^/]+)$/.exec(path);
  if (req.method === 'GET' && recipeMatch) {
    const r = getRecipe(db, decodeURIComponent(recipeMatch[1] as string));
    if (!r) send(res, 404, { error: 'not found' });
    else send(res, 200, r);
    return;
  }
  const costMatch = /^\/api\/recipes\/([^/]+)\/cost$/.exec(path);
  if (req.method === 'GET' && costMatch) {
    const id = decodeURIComponent(costMatch[1] as string);
    const url = new URL(req.url ?? '/', 'http://x');
    const variantId = url.searchParams.get('variantId');
    const out = await runCalc(() => costRecipe({ recipes: allRecipes(db), purchasesByIngredient: latestPurchaseByIngredient(db), targetRecipeId: id, ...(variantId ? { variantId } : {}) }));
    send(res, 200, out);
    return;
  }
  // Imports
  if (req.method === 'POST' && path === '/api/imports/preview') {
    const b = (await readJson()) as unknown as { kind: 'recipe_json' | 'purchase_json' | 'recipe_csv' | 'purchase_csv' | 'pasted_text'; payloadText: string };
    send(res, 200, previewImport(db, b.kind, b.payloadText));
    return;
  }
  if (req.method === 'POST' && path === '/api/imports/commit') {
    const b = (await readJson()) as unknown as { token: string; confirm: boolean };
    send(res, 200, commitImport(db, b.token, b.confirm));
    return;
  }
  // Tasks
  if (req.method === 'GET' && path === '/api/tasks') {
    send(res, 200, listTasks(db));
    return;
  }
  if (req.method === 'POST' && path === '/api/tasks') {
    const b = (await readJson()) as unknown as { title: string };
    send(res, 200, createTask(db, b.title));
    return;
  }
  const taskMatch = /^\/api\/tasks\/([^/]+)\/state$/.exec(path);
  if (req.method === 'POST' && taskMatch) {
    const b = (await readJson()) as unknown as { state: 'open' | 'in_progress' | 'awaiting_approval' | 'completed'; blockedReason?: string; cancellation?: string };
    send(res, 200, setTaskState(db, decodeURIComponent(taskMatch[1] as string), b.state, b));
    return;
  }
  // Approvals
  if (req.method === 'GET' && path === '/api/approvals') {
    send(res, 200, listApprovals(db));
    return;
  }
  if (req.method === 'POST' && path === '/api/approvals/request') {
    const b = (await readJson()) as unknown as { objectType: string; objectId: string };
    send(res, 200, requestApproval(db, b.objectType, b.objectId));
    return;
  }
  if (req.method === 'POST' && path === '/api/approvals/decide') {
    const b = (await readJson()) as unknown as { id: string; approve: boolean };
    send(res, 200, decideApproval(db, b.id, b.approve));
    return;
  }
  // Exports
  if (req.method === 'POST' && path === '/api/exports') {
    const b = (await readJson()) as unknown as { format: 'json' | 'recipe-cards' | 'cost-sheets'; file: string };
    const file = b.format==='cost-sheets'?exportCostSheets(db,workspaceRoot,b.file):b.format === 'json' ? exportJson(db, workspaceRoot, b.file) : exportRecipeCards(db, workspaceRoot, b.file);
    send(res, 200, { file });
    return;
  }
  // Workflows config
  if (req.method === 'GET' && path === '/api/workflows-config') {
    send(res, 200, getWorkflowsConfig(db));
    return;
  }
  if (req.method === 'POST' && path === '/api/workflows-config') {
    const b = await readJson();
    send(res, 200, setWorkflowsConfig(db, b));
    return;
  }
  send(res, 404, { error: 'unknown api route' });
}

function serveUi(req: IncomingMessage, res: ServerResponse, path: string, uiDir: string, send: Send): void {
  if (req.method !== 'GET') {
    send(res, 404, { error: 'not found' });
    return;
  }
  const rel = path === '/' ? 'index.html' : path.slice(1);
  const abs = resolve(uiDir, rel);
  const root = resolve(uiDir);
  if (abs !== root && !abs.startsWith(root + sep)) {
    send(res, 403, { error: 'rejected' });
    return;
  }
  const file = existsSync(abs) ? abs : join(root, 'index.html');
  if (!existsSync(file)) {
    send(res, 200, '<html><body><h1>Kitchen Tools</h1><p>UI not built. Run npm run build.</p></body></html>', 'text/html');
    return;
  }
  const data = readFileSync(file);
  send(res, 200, data.toString('utf8'), MIME[extname(file)] ?? 'text/plain');
}
