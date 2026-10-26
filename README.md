# Open Kitchen Toolkit

Free, original MIT kitchen workflows for your chosen AI, plus deterministic calculations and a private local workspace. Version0.2.0 expands the original toolkit to73 canonical workflows and five connected kitchen flows. No toolkit subscription, account or model API key is required. Your chosen AI service and hosting retain their own costs and account requirements.

[Public setup](https://culinaryos-kitchen-tools-production.up.railway.app) · [Source](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools) · [Downloads](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases)

## Start with your AI

Public MCP URL: `https://culinaryos-kitchen-tools-production.up.railway.app/mcp` (no authentication).

Choose the configuration in `clients/` for ChatGPT, Claude Code, Cursor, Gemini CLI, Codex or generic MCP. Merge fragments; do not overwrite existing client settings. Gemini CLI is distinct from the Gemini consumer website. `docs/playbooks/Open-Kitchen-Playbook.md` works as manual guidance in other clients without implying live tools. Client installation status is explicit in docs/COMPATIBILITY.md.

Try: “Find recipe costing in the workflow library, then convert32ounces to pounds.” Public mode is stateless and cannot read your files or create private tasks.

## Start a private kitchen workspace

Requires Node24 or later. Extract the full toolkit ZIP and open `launchers/Start-Kitchen-Workspace.cmd` on Windows, `Start-Kitchen-Workspace.command` on macOS, or run `sh launchers/start-kitchen-workspace.sh` on Linux. The launcher checks Node, installs locked runtime dependencies when absent and starts http://127.0.0.1:3101. macOS may require `chmod +x` on the supplied launchers depending on extraction permissions. No elevated install is required by the toolkit itself.

Records default to your local application-data directory. Set `KITCHEN_WORKSPACE` to deliberately select another folder. Keep the workspace running for enabled schedules. Closing it stops processing; reopening performs bounded catch-up. No background model service runs.

From source:

```sh
npm ci
npm run build
npm run start:local -- --workspace ./workspace
```

In Settings, supply the kitchen values relevant to your work. Import reviewed recipe/purchase JSON or CSV through preview and confirmation. The Library provides73 original guides. Today shows scheduled rules and connected runs, blockers, source revisions, draft documents and exact-revision approvals.

## Connected flows

- Recipe release: reviewed records → costs → supplied card/SOP drafts → human package approval. Recipe release approval also approves the exact underlying recipe revision for prep.
- Supplier price change: confirmed purchase import → recursively affected recipes → revised costs → stale-source flags → review tasks.
- Daily service: confirmed demand and counted stock → current approved recipe yields → capacity/ordering checks → service-brief draft → review.
- Event planning: supplied quote/budget, resource intervals and guest-level evidence → capacity/dietary checks → event-plan draft → review.
- Service close: actual stock and observed waste → variance → follow-up review task.

For event/close inputs or more detailed daily capacity/ordering records, use the explicit local MCP tools. The local UI can inspect, attach drafts and approve these runs. Draft creation never places an order, sends a message or changes a menu.

## Local MCP and portable CLI

`npm run mcp:public` exposes14 stateless tools. `npm run mcp:local -- --workspace /absolute/private/workspace` adds24 local tools. Local mode deliberately grants your local AI client access to selected private records; do not publish that connection. The public9 original tools and all12 original workflow IDs remain compatible.

Package executables: `kitchen-tools` (CLI) and `kitchen-tools-mcp` (stdio). `kitchen-tools-mcp --mode=public` is the no-workspace default. A version-pinned .tgz is included in releases for npm-compatible installation without an npm-registry publication requirement.

## Backup, exports and migrations

`npm run cli -- backup --workspace ./workspace --out backup/kitchen-tools.sqlite` makes a consistent SQLite backup. Stop the workspace before restoring a full backup. JSON exports retain the original v1 recipe/purchase fields and add profile, workflow records, tasks, approvals and schedules for portability. Backup is the full-fidelity restore format.

Opening a pre-v2 workspace creates a `.pre-v2-...sqlite` backup beside the original before migration. A failed backup stops migration. Existing rows are preserved; future schema versions are refused.

## Development and evidence

`npm run typecheck`, `npm test`, `npm run check:scenarios`, `node scripts/release-acceptance.mjs`, `npm run package`.

The387-case bank contains designed tests, not387 completed AI conversations. Protocol reference checks, deterministic tests, editorial example reviews, live-comparison scope, native client installation and production kitchen acceptance are separate in docs/ACCEPTANCE.md. See docs/CONNECTIONS.md for tool inputs and docs/PROVENANCE.md for original-content boundaries.

CulinaryOS integration remains an optional explicitly authorized tenant-bound file exchange, not live API synchronization. Allergen data distinguishes contains, may_contain, verified_absent and unknown; missing labels never prove absence. Local safety/legal controls and supplier records need verified sources and human review.
