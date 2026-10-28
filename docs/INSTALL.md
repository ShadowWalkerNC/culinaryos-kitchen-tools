# Use Chef Intelligence — CulinaryOS Intelligence

## Skills and templates: the quickest start

**[Download the skills ZIP, version 0.3.0-rc.5](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.5/chef-intelligence-skills-0.3.0-rc.5.zip)**.

Extract it and open `START_HERE.md`. Choose one skill or template, attach or paste it into your AI and describe the task. `INDEX.md` lists skills; `prompts/STARTERS.md` supplies 24 guided prompts. For a plain menu, follow `boilerplates/menus/README.md`: fill a supplied HTML layout, review it and print to PDF from your browser.

This route requires no Node installation, MCP connection or extra toolkit account. Use your client's supported file or project-instruction features. It is a reference package, not one universal installer. AI-provider accounts, permissions and charges still apply.

## Optional: connected tools

The [public setup page](https://culinaryos-kitchen-tools-production.up.railway.app/#connect) provides the no-authentication MCP endpoint and client configurations. Merge the relevant fragment into existing settings; keep unrelated connections intact. The public service is stateless and cannot read private workspaces.

### Codex candidate: new installation

These commands select the displayed candidate tag and preserve the existing `kitchen-tools` identity:

```sh
codex plugin marketplace add ShadowWalkerNC/culinaryos-kitchen-tools --ref v0.3.0-rc.5
codex plugin add kitchen-tools@open-kitchen-toolkit
```

Start a fresh Codex session afterward. Check `codex plugin list --marketplace open-kitchen-toolkit --json`; verify the actual version, `installed: true` and `enabled: true`. A cached folder alone is not installation evidence. CLI commands were checked against the available Codex help; fresh installation/model execution remains subject to the [compatibility evidence](COMPATIBILITY.md).

### Existing Codex installation

Inspect `codex plugin marketplace list --json` and the installed version first. `codex plugin marketplace upgrade open-kitchen-toolkit` refreshes the marketplace's **configured ref**; it does not switch an installation pinned to 0.2.4 onto the new candidate. To select another ref, use the marketplace source controls supported by your Codex version, then add/update the same plugin and verify its version. Check `codex plugin marketplace add --help` and `upgrade --help` before changing an existing source. Do not hand-edit caches or remove unrelated plugins.

The previous stable release can be selected deliberately with `--ref v0.2.4`. It does not contain the newer candidate files. GitHub community downloads are separate from an OpenAI-reviewed directory listing.

### ChatGPT and other clients

The existing personal plugin is updated in its owning account; private storage does not establish installation or public availability on every ChatGPT surface. If your account supports custom MCP connections, use the public URL with no authentication. Codex installation does not install a plugin on ChatGPT website/mobile.

Claude, Cursor, Gemini CLI and other supported MCP clients have separate connection routes on the setup page. Gemini CLI and the Gemini consumer website are distinct products. Clients without verified MCP support can use the skills ZIP as manual guidance. See [compatibility and remaining installation gates](COMPATIBILITY.md).

### Check the connection

Ask: **“Use the toolkit to convert 32 ounces to pounds.”** The known result is **2 lb**. Then ask for the `recipe-costing` workflow. A successful tool result establishes those calls; a model's unsupported claim does not. Respect the host's approval controls.

## Optional: private local workspace

Download the [full runtime ZIP](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.5/open-kitchen-toolkit-0.3.0-rc.5.zip), extract it and open the launcher for Windows, macOS or Linux in `launchers/`. Node 24+ is required. The launcher checks prerequisites and installs locked runtime dependencies when missing.

Use `clients/local.json` only with your deliberately selected absolute toolkit/workspace paths. Keep private connections private. Enabled schedules run while the workspace is open; no background AI provider is added.

## CulinaryOS and Ross Manor

CulinaryOS uses separately selected tenant-bound export files in this release. Live API/sign-in synchronization remains deferred. Ross Manor Paperwork remains a separately authorized specialist; see [privacy and handoff boundaries](ROSS_MANOR_INTEGRATION.md). Installation does not authorize record sharing.
