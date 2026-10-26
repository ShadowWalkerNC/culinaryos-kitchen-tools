// F15 public HTTP: stateless only. No DB, secrets, files, UI, persistence.
import { createServer } from 'node:http';
import { handleMcpStreamable } from '../mcp/httpStream.js';
import { readBodyCapped, logMeta, createCalcRunner } from './security.js';
import { publicPage } from './publicPage.js';
import { VERSION } from '../version.js';
import { clientConfigurations, playbook } from '../distribution.js';
/** Exported for handler-level tests (no TCP needed). */
export function createPublicHandler(port) {
    const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, ...(process.env.PUBLIC_HOSTS ?? '').split(','), process.env.RAILWAY_PUBLIC_DOMAIN ?? ''].map(x => x.trim().toLowerCase()).filter(Boolean));
    const origins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`, ...[...hosts].filter(h => !h.startsWith('localhost:') && !h.startsWith('127.0.0.1:')).map(h => `https://${h}`), ...(process.env.PUBLIC_ORIGINS ?? '').split(',').map(x => x.trim()).filter(Boolean)]);
    const run = createCalcRunner();
    const send = (res, status, body) => {
        const payload = JSON.stringify(body);
        // No wildcard CORS: same-origin only, no ACAO header emitted.
        res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
        res.end(payload);
    };
    return (req, res) => {
        const started = Date.now();
        void (async () => {
            try {
                const url = new URL(req.url ?? '/', 'http://x');
                if (!hosts.has((req.headers.host ?? '').toLowerCase())) {
                    send(res, 403, { error: 'bad host' });
                    return;
                }
                if (req.headers.origin !== undefined && !origins.has(String(req.headers.origin))) {
                    send(res, 403, { error: 'bad origin' });
                    return;
                }
                if (req.method === 'GET' && url.pathname === '/') {
                    const html = publicPage(req.headers.host);
                    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-length': Buffer.byteLength(html), 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'" });
                    res.end(html);
                    return;
                }
                if (req.method === 'GET' && url.pathname === '/connection.json') {
                    const host = req.headers.host;
                    const local = /^(localhost|127\.0\.0\.1):\d+$/.test(host);
                    send(res, 200, { $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', mcpServers: { 'kitchen-tools': { type: 'streamable-http', url: `${local ? 'http' : 'https'}://${host}/mcp`, extensions: { 'com.openai': { auth: { type: 'none' } } } } } });
                    return;
                }
                if (req.method === 'GET' && url.pathname.startsWith('/clients/')) {
                    const name = url.pathname.slice('/clients/'.length), host = req.headers.host, local = /^(localhost|127\.0\.0\.1):\d+$/.test(host);
                    const configs = clientConfigurations(`${local ? 'http' : 'https'}://${host}/mcp`);
                    const value = Object.hasOwn(configs, name) ? configs[name] : undefined;
                    if (value === undefined) {
                        send(res, 404, { error: 'unknown client configuration' });
                        return;
                    }
                    res.writeHead(200, { 'content-type': name.endsWith('.toml') ? 'text/plain; charset=utf-8' : 'application/json', 'content-disposition': `attachment; filename="${name}"`, 'x-content-type-options': 'nosniff' });
                    res.end(value);
                    return;
                }
                if (req.method === 'GET' && url.pathname === '/playbooks/all.md') {
                    const text = playbook();
                    res.writeHead(200, { 'content-type': 'text/markdown; charset=utf-8', 'content-disposition': 'attachment; filename="Open-Kitchen-Playbook.md"', 'x-content-type-options': 'nosniff' });
                    res.end(text);
                    return;
                }
                if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/healthz')) {
                    send(res, 200, { ok: true });
                    return;
                }
                if (req.method === 'GET' && url.pathname === '/version') {
                    send(res, 200, { version: VERSION, dataVersion: 'v1', mode: 'public-stateless' });
                    return;
                }
                if (url.pathname === '/mcp') {
                    if (req.method !== 'POST') {
                        send(res, 405, { error: 'method not allowed' });
                        return;
                    }
                    const raw = await readBodyCapped(req);
                    const parsed = raw.length > 0 ? JSON.parse(raw.toString('utf8') || 'null') : undefined;
                    await run(() => handleMcpStreamable(req, res, 'public', undefined, parsed));
                    return;
                }
                send(res, 404, { error: 'not found' });
            }
            catch (e) {
                const msg = e.message;
                if (msg === 'BODY_TOO_LARGE')
                    send(res, 413, { error: 'request too large (1MB max)' });
                else if (msg === 'CALC_BUSY' || msg === 'CALC_TIMEOUT')
                    send(res, 503, { error: 'temporarily unavailable; retry later' });
                else
                    send(res, 400, { error: 'invalid request' });
            }
            finally {
                logMeta(req.method, req.url, res.statusCode, Date.now() - started);
            }
        })();
    };
}
export function startPublicServer(opts) {
    const server = createServer(createPublicHandler(opts.port));
    server.requestTimeout = 15000;
    server.headersTimeout = 15000;
    server.on('error', (e) => {
        process.stderr.write(`public server error: ${e.message}\n`);
    });
    const ready = new Promise((resolve) => {
        server.once('listening', () => resolve(true));
        server.once('error', () => resolve(false));
    });
    server.listen(opts.port, opts.host ?? '0.0.0.0');
    return {
        port: opts.port,
        ready,
        close: () => new Promise((r) => server.close(() => r())),
    };
}
//# sourceMappingURL=publicHttp.js.map