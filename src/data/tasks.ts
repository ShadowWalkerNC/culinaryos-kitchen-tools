// F12 tasks + F09 approvals: version-bound, explicit states.
import { newId, nowIso, transact, type Db } from './db.js';

export type TaskState = 'open' | 'in_progress' | 'awaiting_approval' | 'completed';
export interface Task {
  id: string;
  title: string;
  state: TaskState;
  blockedReason?: string;
  cancellation?: string;
  history: Array<{ at: string; event: string }>;
}

export function createTask(db: Db, title: string, opts: { now?: () => Date } = {}): Task {
  if(typeof title!=='string'||!title.trim()||title.length>500)throw new Error('task title required (1-500 characters)');
  const clock = opts.now ?? (() => new Date());
  const id = newId('task');
  const at = nowIso(clock);
  const history = [{ at, event: 'created' }];
  db.raw
    .prepare('INSERT INTO tasks (id, title, state, blocked_reason, cancellation, history, created_at, updated_at) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?)')
    .run(id, title, 'open', JSON.stringify(history), at, at);
  return { id, title, state: 'open', history };
}

export function listTasks(db: Db): Task[] {
  const rows = db.raw.prepare('SELECT id, title, state, blocked_reason as blockedReason, cancellation, history FROM tasks ORDER BY id').all() as Array<{
    id: string;
    title: string;
    state: TaskState;
    blockedReason: string | null;
    cancellation: string | null;
    history: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    state: r.state,
    ...(r.blockedReason ? { blockedReason: r.blockedReason } : {}),
    ...(r.cancellation ? { cancellation: r.cancellation } : {}),
    history: JSON.parse(r.history) as Task['history'],
  }));
}

export function setTaskState(db: Db, id: string, state: TaskState, opts: { blockedReason?: string; cancellation?: string; now?: () => Date } = {}): Task {
  if(!['open','in_progress','awaiting_approval','completed'].includes(state))throw new Error('invalid task state');
  const clock = opts.now ?? (() => new Date());
  return transact(db, () => {
    const row = db.raw.prepare('SELECT id, title, state, blocked_reason, cancellation, history FROM tasks WHERE id = ?').get(id) as
      | { id: string; title: string; state: TaskState; blocked_reason: string | null; cancellation: string | null; history: string }
      | undefined;
    if (!row) throw new Error(`unknown task ${id}`);
    if(state==='completed' && (opts.blockedReason??row.blocked_reason))throw new Error('resolve the blocked reason before completing');
    if(row.cancellation)throw new Error('cancelled task cannot change state');
    const history = JSON.parse(row.history) as Task['history'];
    history.push({ at: nowIso(clock), event: `state -> ${state}` });
    db.raw
      .prepare('UPDATE tasks SET state = ?, blocked_reason = ?, cancellation = ?, history = ?, updated_at = ? WHERE id = ?')
      .run(state, opts.blockedReason ?? row.blocked_reason, opts.cancellation ?? row.cancellation, JSON.stringify(history), nowIso(clock), id);
    return listTasks(db).find((t) => t.id === id)!;
  });
}

export type ApprovalState = 'pending' | 'approved' | 'rejected';
export interface Approval {
  id: string;
  objectType: string;
  objectId: string;
  objectVersion: number;
  state: ApprovalState;
}

export function requestApproval(db: Db, objectType: string, objectId: string, opts: { now?: () => Date } = {}): Approval {
  const clock = opts.now ?? (() => new Date());
  // Bind exact current version.
  const table = objectType === 'recipe' ? 'recipes' : objectType === 'purchase' ? 'purchases' : null;
  if (!table) throw new Error('objectType must be recipe or purchase');
  const cur = db.raw.prepare(`SELECT version FROM ${table} WHERE id = ?`).get(objectId) as { version: number } | undefined;
  if (!cur) throw new Error(`unknown ${objectType} ${objectId}`);
  const id = newId('appr');
  db.raw
    .prepare('INSERT INTO approvals (id, object_type, object_id, object_version, state, created_at, decided_at) VALUES (?, ?, ?, ?, ?, ?, NULL)')
    .run(id, objectType, objectId, cur.version, 'pending', nowIso(clock));
  return { id, objectType, objectId, objectVersion: cur.version, state: 'pending' };
}

export function decideApproval(db: Db, id: string, approve: boolean, opts: { now?: () => Date } = {}): Approval {
  if(typeof approve!=='boolean')throw new Error('explicit approval decision required');
  const clock = opts.now ?? (() => new Date());
  return transact(db, () => {
    const row = db.raw.prepare('SELECT id, object_type as objectType, object_id as objectId, object_version as objectVersion, state FROM approvals WHERE id = ?').get(id) as
      | { id: string; objectType: string; objectId: string; objectVersion: number; state: ApprovalState }
      | undefined;
    if (!row) throw new Error(`unknown approval ${id}`);
    if (row.state !== 'pending') throw new Error(`approval ${id} already decided`);
    const table = row.objectType === 'recipe' ? 'recipes' : 'purchases';
    const cur = db.raw.prepare(`SELECT version FROM ${table} WHERE id = ?`).get(row.objectId) as { version: number } | undefined;
    if (!cur || cur.version !== row.objectVersion) throw new Error(`STALE_VERSION for approval ${id}`);
    const state: ApprovalState = approve ? 'approved' : 'rejected';
    db.raw.prepare('UPDATE approvals SET state = ?, decided_at = ? WHERE id = ?').run(state, nowIso(clock), id);
    return { id, objectType: row.objectType, objectId: row.objectId, objectVersion: row.objectVersion, state };
  });
}

export function listApprovals(db: Db): Approval[] {
  return db.raw.prepare('SELECT id, object_type as objectType, object_id as objectId, object_version as objectVersion, state FROM approvals ORDER BY id').all() as unknown as Approval[];
}
