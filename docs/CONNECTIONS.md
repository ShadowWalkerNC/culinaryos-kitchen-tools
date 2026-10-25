# Connect a compatible AI client

The portable plugin defaults to **public stateless stdio**. Install Node 24+, run `npm ci` and `npm run build` in the package, then use the included `mcp.json` with a host that supports local MCP plugins. Host installation differs and is not verified merely by protocol tests.

For a client that accepts a raw local MCP configuration, use `node` as the command and the absolute path to `dist/mcp/stdio.js` as the first argument, followed by `--mode=public`. Keep logs on stderr. No plugin login is required.

To deliberately grant a local AI client access to your private workspace, change the arguments to `--mode=local --workspace <absolute workspace directory>`. This exposes import, task, approval and export tools to that local client. Do not publish that connection, share its workspace, or use it as the public server.

The public hosted endpoint is **https://culinaryos-kitchen-tools-production.up.railway.app/mcp**. Choose no authentication in a compatible client's custom MCP settings. Download its portable configuration from https://culinaryos-kitchen-tools-production.up.railway.app/connection.json. No additional toolkit account or API key is required; the AI client's own account, plan and connection rules apply.

The private personal plugin is https://chatgpt.com/plugins/plugins_6ade6883fbe48191b7d6651289203e6d. It contains the twelve skills and hosted connection. It is not listed for public discovery. Others can use the public endpoint or import the shareable remote plugin ZIP in compatible hosts.

For self-hosting, start the public service with `npm run start:public`; deploy using the supplied Dockerfile. Set `PUBLIC_HOSTS` to the exact deployed hostname (without scheme) or use Railway's injected `RAILWAY_PUBLIC_DOMAIN`. Optional `PUBLIC_ORIGINS` is an explicit comma-separated origin allowlist. `PORT` is honored. Match the hosting domain's target port to the injected runtime port (8080 in this Railway deployment).

The public connection does not grant access to your local files. Supply selected data explicitly in the AI conversation. Never send credentials, customer records or unneeded business information. The user's AI provider has its own account and data policies.

Run a harmless test after connecting: list capabilities, convert 32 oz to lb, then cost a synthetic recipe. Confirm the public list has nine tools and does not contain `commit_import` or `list_recipes`.
