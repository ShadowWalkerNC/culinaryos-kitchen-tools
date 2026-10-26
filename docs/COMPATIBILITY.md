# Client compatibility and installation evidence

Date:2026-10-25. Configurations target documented MCP interfaces. Configuration generation and MCP reference-client tests are separate from installing in the named AI product.

| Client | Supplied route | Native install/discovery/call status |
|---|---|---|
| ChatGPT | Hosted no-auth MCP and portable plugin ZIP | UNVERIFIED in ChatGPT account/UI |
| Claude | Remote connector guide and Claude Code config | UNVERIFIED; no Claude CLI present in current environment |
| Cursor | Reviewed install-link format and JSON | UNVERIFIED; no Cursor CLI present in current environment |
| Gemini CLI | httpUrl fragment and actual isolated project install | CLI 0.63.0 reported Connected; model session did not expose kitchen tools. Workflow/calculation acceptance UNVERIFIED |
| Codex | Remote TOML and actual per-invocation override | CLI 0.161.0 discovered definitions; native approval policy blocked all calls. Full acceptance UNVERIFIED |
| Generic MCP SDK client | Actual stdio+Streamable HTTP | See evidence/reference-protocol.json and hosted smoke evidence |
| Gemini consumer website / other chat hosts | Manual Markdown playbook | No live MCP support claimed |

No host account is created, no user configuration is overwritten and no credential is bundled. Host-managed approvals and access rules remain active. Manual use of a playbook does not supply storage, deterministic calculators or background execution.

Official setup sources are linked in CONNECTIONS.md. Promote a row to verified only after recording the actual product/version, install route, tool discovery, original workflow retrieval and known-cost call. Do not infer all plan eligibility from documentation or one account.

Bounded native attempts and limitations: `evidence/native-client-trials.json`. No host approval policy was bypassed.
