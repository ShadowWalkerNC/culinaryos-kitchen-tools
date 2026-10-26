# Choose a setup

The hosted public tools need no toolkit account. Your AI provider can require its own account, paid plan, developer mode or workspace approval. Availability differs by account; see the unverified-client matrix in COMPATIBILITY.md.

## ChatGPT

Use the current custom MCP/connector interface in your ChatGPT account. Supply `https://culinaryos-kitchen-tools-production.up.railway.app/mcp` and choose no authentication where available. The downloadable plugin package includes original skills and that public connection; importing ZIPs is host-specific and is not available in every ChatGPT surface. [Official guide](https://developers.openai.com/api/docs/guides/custom-mcp-server).

## Claude

For the Claude web/desktop remote connector interface, add the same hosted URL using the current [custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp). For Claude Code, merge `clients/claude-code.json` into the project's MCP configuration, or use:

```sh
claude mcp add --transport http kitchen-tools https://culinaryos-kitchen-tools-production.up.railway.app/mcp
```

Local stdio is for supported desktop/code surfaces, not a promise that a browser can read local files.

## Cursor

Use the install link on the hosted setup page, review it in Cursor, or merge `clients/cursor.json` into `.cursor/mcp.json`. It adds one public MCP server and no private workspace. [Official install-link format](https://cursor.com/docs/mcp/install-links).

## Gemini CLI

```sh
gemini mcp add --transport http kitchen-tools https://culinaryos-kitchen-tools-production.up.railway.app/mcp
gemini mcp list
```

Alternatively merge `clients/gemini.json` into Gemini CLI settings. This configuration targets Gemini CLI, not the Gemini consumer website. [Official MCP guide](https://geminicli.com/docs/tools/mcp-server/).

## Codex and other MCP clients

Merge `clients/codex.toml` into the supported Codex configuration, or add the URL using the client's MCP settings. `generic.json` is an interchange example; transport field names vary by client. Preserve existing settings.

For private local tools, replace the two absolute path placeholders in `clients/local.json`, select a private workspace and use a supported local stdio client. Start the workspace launcher to enable scheduled rules. A separate stdio connection can read records but does not itself start the scheduler.

## Check your installation

Ask your AI to discover the kitchen tools, list the 73 workflows, retrieve `recipe-costing`, then convert 32 oz to lb (expected 2). For a known cost: four portions using 500 g flour purchased at USD 2.00/kg should cost USD 1.00/batch and USD 0.25/portion. Missing prices must remain unknown. The public connection must not expose private import, task or approval tools.

Clients without supported live tools can use `docs/playbooks/Open-Kitchen-Playbook.md` manually. This supplies instructions only; it does not add saving, calculations or automation.
