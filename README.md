# Kitchen Tools (standalone, local-first)

Original MIT toolkit for deterministic recipe costing, scaling, prep, and ordering. No Axomai or Cheezies content included.

Use the [public setup page](https://culinaryos-kitchen-tools-production.up.railway.app) or connect a compatible AI client to `https://culinaryos-kitchen-tools-production.up.railway.app/mcp` with no authentication. The toolkit needs no extra account; your AI client's account/plan requirements still apply. Public mode has nine stateless tools and twelve original workflows. Private records, tasks, approvals and scheduled rules use the separately installed local workspace.

The created [personal plugin](https://chatgpt.com/plugins/plugins_6ade6883fbe48191b7d6651289203e6d) is private, not directory listed. Other users can use the public endpoint or a portable remote plugin package. See [connection instructions](docs/CONNECTIONS.md) and [acceptance evidence](docs/ACCEPTANCE.md).

## Install

Requires Node >= 24.

```sh
cd kitchen-tools
npm ci
npm run build
```

Portable packaging (`npm run package`) copies shippable files to `package-out/` (excludes DB, workspace, credentials, node_modules). Run `npm ci` inside `package-out` for locked dependencies.

## Run

Local UI + API (binds 127.0.0.1:3101, serves built React UI):

```sh
npm run start:local -- --workspace ./workspace
```

Open http://127.0.0.1:3101 in a browser. The UI fetches a session token from the same-origin `/api/session` endpoint automatically.

Public stateless server (setup page and MCP; no restaurant DB):

```sh
npm run start:public
```

MCP stdio (separate registrations):

```sh
npm run mcp:public
npm run mcp:local -- --workspace ./workspace
```

CLI: `npm run cli -- version|local-serve|public-serve|worker|worker-run|worker-recover|backup|tool|read-culinaryos`

Start continuous rules execution with `npm run cli -- worker --workspace ./workspace`. It checks every ten seconds. Configure timezone, cutoff, enable switches and confirmed service forecasts in Today. Recipe approval must match the current version. Missing data creates an action-required task. Schedules do not run merely because the UI is open.

`npm run cli -- tool list_runs --workspace ./workspace --json '{}'` reads recent runs. Every local tool is also callable through this CLI command. To read an explicitly authorized tenant-bound export, use `read-culinaryos --workspace ./workspace --tenant YOUR_TENANT --file export.json --confirm`; it does not contact a live CulinaryOS server.

Dev: run `npm run build` then `npm run dev` to execute server source with the built UI.

## Backup / recovery

```sh
npm run cli -- backup --workspace ./workspace --out backup/kitchen-tools.sqlite
```

Restore by copying the backup file back to `<workspace>/kitchen-tools.sqlite` while the server is stopped. Exports stay inside the workspace (`exports/`).

## Self-host (public mode)

Stateless Docker image + Railway config included. No DB mount, health check on `/health`:

```sh
docker build -t kitchen-tools-public .
docker run -p 3102:3102 kitchen-tools-public
```

## Protocol / client status

| Check | Result |
|---|---|
| MCP stdio public (list + call) | Tested (automated) |
| MCP Streamable HTTP public (list + call) | Tested (automated) |
| MCP local tools via stdio | Tested (automated, in-memory) |
| Local HTTP API + session flow | Tested (automated) |
| Desktop/mobile visual and interaction acceptance | NOT RUN (browser automation unavailable) |
| Host/origin/size rejections | Tested (automated) |
| Public cannot list/call local tools | Tested (automated) |
| Live hosted deployment | PASS: anonymous HTTPS and actual MCP calls, 2026-10-25 |
| Personal plugin creation | PASS: twelve skills and remote configuration retained; client installation separate |
| Third-party AI clients (Claude/Cursor/etc.) | NOT RUN |
| Kitchen trials / publication | NOT RUN |
| Live CulinaryOS integration | NOT RUN (file-exchange adapter only, fixture-tested) |

## Docs

- `docs/PRODUCT_REQUIREMENTS.md`, `TECHNICAL_REQUIREMENTS.md`, `FLOWS.md`, `DATA_OWNERSHIP.md`, `IMPLEMENTATION.md`, `SECURITY.md`, `PROVENANCE.md`
- `skills/*/SKILL.md` — twelve original MIT skills.
