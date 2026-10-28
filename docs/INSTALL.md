# Use Chef Intelligence — CulinaryOS Interagency

## Recommended: skills and boilerplates only

Download `chef-intelligence-skills-0.3.0-rc.2.zip` from the [candidate release](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/tag/v0.3.0-rc.2). Read START_HERE.md, then the relevant skill. Paste it into your AI or use its supported file/project-instruction feature. No runtime, MCP or new toolkit account is required. Provider accounts and charges still apply; there is no universal ZIP-install interface.

Optional connected adapters follow below. The stable Git marketplace commands remain on the previous stable source. To opt into this candidate use the same marketplace name with `--ref codex/chef-intelligence-package`; verify the actual installed version and reopen the host.

The public GitHub marketplace below is a directly installable community release. It is separate from an OpenAI-reviewed public directory listing. No toolkit account or model key is needed; your AI client's account requirements apply.

## Codex CLI and desktop

With Codex installed, run these two commands:

```sh
codex plugin marketplace add ShadowWalkerNC/culinaryos-kitchen-tools --ref codex/initial-release
codex plugin add kitchen-tools@open-kitchen-toolkit
```

Restart the desktop app or start a new Codex session after installation so it can load the newly enabled plugin. Check `codex plugin list --marketplace open-kitchen-toolkit --json`: the toolkit should say `installed: true` and `enabled: true`. A cached package directory alone does not establish installation.

In a fresh chat, select Open Kitchen Toolkit and say: **“Show me how to use Open Kitchen Toolkit.”** Then try: **“Use the toolkit to convert32 ounces to pounds.”** The known result is2 lb. If tools are unavailable or permissions are denied, report the host's actual status rather than claiming the calculation executed. Normal kitchen questions require no special keywords.

The plugin's `mcp.json` connects to the hosted public service. It does not require an absent `dist/` folder or a local dependency installation. The full source/runtime download remains available for optional local private workflows; use `clients/local.json` with explicitly selected paths for those. Do not publish a private local workspace connection.

## ChatGPT website/mobile

The existing personal plugin is saved under its original identity. Open its personal installation page while signed into the owning account: https://chatgpt.com/plugins/plugins_6ade6883fbe48191b7d6651289203e6d . Its actual availability depends on that account and surface; private account storage is not public-directory approval or proof of installation.

If your account offers custom remote MCP connections, use the hosted URL from the public setup page with no authentication. ChatGPT Work/workspace marketplace import and consumer website/mobile support differ. Do not assume the Codex CLI installation changes website or mobile installation state. A globally discoverable OpenAI directory release requires publisher verification, listing materials, portal checks/review and publication after approval.

## Other AI clients

Use the public setup page and `clients/` configurations for supported Claude, Cursor, Gemini CLI and other MCP clients. The Gemini consumer website is distinct from Gemini CLI. Clients without verified MCP support can use the downloadable Markdown playbook as manual guidance, without claiming live tools.

## Ross Manor specialist

For care-facility menus, use the separately installed Ross Manor Paperwork plugin alongside the toolkit. See [integration boundaries and test prompt](ROSS_MANOR_INTEGRATION.md). The public kitchen connection does not expose its local renderer or facility records.
