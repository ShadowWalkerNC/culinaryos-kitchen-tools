#!/usr/bin/env node
// CLI entry: local-serve | public-serve | worker-run | worker-recover | backup | version
import { VERSION } from '../version.js';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../data/db.js';
import { startLocalServer } from '../server/localHttp.js';
import { startPublicServer } from '../server/publicHttp.js';
import { systemClock } from '../jobs/clocks.js';
import { recoverInterrupted, DEFAULT_WORKER_CONFIG } from '../jobs/worker.js';
import { getWorkflowsConfig } from '../mcp/localTools.js';
import { backupDb, assertInside } from '../data/exports.js';
import { workerTick, saveForecast } from '../jobs/worker.js';
import { localHandlers } from '../mcp/localTools.js';
import { readExportFile } from '../adapter/culinaryosFile.js';
import { formatMenu } from '../core/menus.js';
import { findKitchenHelp } from '../workflows/help.js';
function arg(name, def) {
    const i = process.argv.indexOf(name);
    if (i >= 0 && process.argv[i + 1])
        return process.argv[i + 1];
    return def;
}
function here(rel) {
    return join(dirname(fileURLToPath(import.meta.url)), '..', '..', rel);
}
async function main() {
    const cmd = process.argv[2] ?? 'version';
    if (cmd === 'help-kitchen') {
        console.log(JSON.stringify(findKitchenHelp(JSON.parse(arg('--json', '{}')))));
        return;
    }
    if (cmd === 'menu') {
        console.log(JSON.stringify(formatMenu(JSON.parse(arg('--json', '{}')))));
        return;
    }
    if (cmd === 'version') {
        console.log(JSON.stringify({ version: VERSION, dataVersion: 'v1' }));
        return;
    }
    if (cmd === 'local-serve') {
        const port = Number(arg('--port', '3101'));
        const workspace = arg('--workspace', './workspace');
        const uiDir = arg('--ui', here('dist/ui'));
        mkdirSync(workspace, { recursive: true });
        const localServer = startLocalServer({ port, workspaceRoot: workspace, uiDir, dev: process.argv.includes('--dev') });
        process.once('SIGINT', () => { void localServer.close().then(() => process.exit(0)); });
        process.once('SIGTERM', () => { void localServer.close().then(() => process.exit(0)); });
        if (!await localServer.ready) {
            await localServer.close();
            throw new Error('Workspace could not start; check the port and workspace permissions');
        }
        console.log(`local server on http://127.0.0.1:${port} workspace=${workspace}`);
        await new Promise(() => undefined);
        return;
    }
    if (cmd === 'public-serve') {
        const port = Number(arg('--port', process.env.PORT ?? '3102'));
        const publicServer = startPublicServer({ port, host: arg('--host', '0.0.0.0') });
        if (!await publicServer.ready)
            throw new Error('Public service could not start');
        console.log(`public stateless server on :${port}`);
        await new Promise(() => undefined);
        return;
    }
    if (cmd === 'tool' || cmd === 'read-culinaryos') {
        const workspace = arg('--workspace', './workspace');
        mkdirSync(workspace, { recursive: true });
        if (cmd === 'read-culinaryos') {
            console.log(JSON.stringify(readExportFile(workspace, arg('--tenant', ''), arg('--file', ''), process.argv.includes('--confirm'))));
            return;
        }
        const db = openDb(join(workspace, 'kitchen-tools.sqlite'));
        try {
            const h = localHandlers({ db, workspaceRoot: workspace });
            const fn = h[process.argv[3]];
            if (!fn)
                throw new Error('unknown local tool');
            console.log(JSON.stringify(fn(JSON.parse(arg('--json', '{}')))));
        }
        finally {
            db.close();
        }
        return;
    }
    if (cmd === 'worker-run' || cmd === 'worker') {
        const workspace = arg('--workspace', './workspace');
        const occurrence = arg('--occurrence', new Date().toISOString().slice(0, 10));
        const forecastPath = arg('--forecast');
        mkdirSync(workspace, { recursive: true });
        const db = openDb(join(workspace, 'kitchen-tools.sqlite'));
        let config = { ...DEFAULT_WORKER_CONFIG };
        try {
            config = getWorkflowsConfig(db);
        }
        catch {
            // defaults
        }
        const clock = systemClock(config.timezone);
        if (forecastPath) {
            const input = JSON.parse(readFileSync(assertInside(workspace, forecastPath), 'utf8'));
            saveForecast(db, occurrence, input, process.argv.includes('--confirm'), clock);
        }
        recoverInterrupted(db, clock);
        if (cmd === 'worker-run') {
            console.log(JSON.stringify(workerTick(db, clock)));
            db.close();
            return;
        }
        const timer = setInterval(() => { try {
            workerTick(db, systemClock());
        }
        catch {
            process.stderr.write('worker tick failed; retrying at next interval\n');
        } }, 10000);
        workerTick(db, clock);
        const stop = () => { clearInterval(timer); db.close(); process.exit(0); };
        process.once('SIGINT', stop);
        process.once('SIGTERM', stop);
        await new Promise(() => undefined);
        return;
    }
    if (cmd === 'worker-recover') {
        const workspace = arg('--workspace', './workspace');
        const db = openDb(join(workspace, 'kitchen-tools.sqlite'));
        const out = recoverInterrupted(db, systemClock('UTC'));
        console.log(JSON.stringify({ requeued: out }));
        db.close();
        return;
    }
    if (cmd === 'backup') {
        const workspace = arg('--workspace', './workspace');
        const out = arg('--out', 'backup/kitchen-tools.sqlite');
        const file = backupDb(join(workspace, 'kitchen-tools.sqlite'), workspace, out);
        console.log(JSON.stringify({ file }));
        return;
    }
    console.error(`unknown command ${cmd}`);
    process.exit(1);
}
void main().catch((e) => { process.stderr.write(e.message + '\n'); process.exitCode = 1; });
//# sourceMappingURL=cli.js.map