import { workerTick } from './worker.js';
import { systemClock } from './clocks.js';
export function workerStatus(db) { const row = db.raw.prepare("SELECT data FROM workflows_config WHERE id='runtime-health'").get(); if (!row)
    return { state: 'unavailable', message: 'Start the local workspace to run enabled schedules' }; const health = JSON.parse(row.data); return { ...health, state: health.state !== 'stopped' && Date.now() - Date.parse(health.lastCheckAt) > 30000 ? 'unavailable' : health.state, message: 'Rules run while the local workspace is open. No background AI service is used.' }; }
export function startWorkspaceWorker(db, intervalMs = 10000) {
    let stopped = false;
    const persist = (data) => db.raw.prepare("INSERT INTO workflows_config(id,data,updated_at)VALUES('runtime-health',?,?)ON CONFLICT(id)DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at").run(JSON.stringify(data), new Date().toISOString());
    const tick = () => { if (stopped)
        return; const at = new Date().toISOString(); try {
        const result = workerTick(db, systemClock());
        persist({ state: result.prep === 'disabled' && result.events === 0 ? 'idle' : 'running', lastCheckAt: at, nextCheckAt: new Date(Date.now() + intervalMs).toISOString(), lastResult: result, error: null });
    }
    catch (e) {
        persist({ state: 'error', lastCheckAt: at, nextCheckAt: new Date(Date.now() + intervalMs).toISOString(), error: e.message });
    } };
    tick();
    const timer = setInterval(tick, intervalMs);
    timer.unref();
    return () => { stopped = true; clearInterval(timer); persist({ state: 'stopped', lastCheckAt: new Date().toISOString(), nextCheckAt: null }); };
}
//# sourceMappingURL=workspaceWorker.js.map