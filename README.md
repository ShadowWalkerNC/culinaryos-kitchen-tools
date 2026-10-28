# CulinaryOS Interagency — Chef Intelligence

Practical kitchen skills and clean templates for cooks, restaurant teams and home cooks. Ask an ordinary question, work through one task and leave with an answer, calculation or usable draft.

**[Download the skills and templates](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.4/chef-intelligence-skills-0.3.0-rc.4.zip)** · [Public setup](https://culinaryos-kitchen-tools-production.up.railway.app) · [Installation guide](docs/INSTALL.md)

## Start in a minute

1. Extract the skills ZIP and open `START_HERE.md`.
2. Give your AI that page and one relevant skill or template. Use `INDEX.md` if you need help choosing.
3. Describe your task: **“Cost this recipe and show missing prices”**, **“Help me fix this sauce”**, or **“Format my approved menu using this template.”**

No special keywords, toolkit account, subscription or MCP connection are required for manual use. Your AI provider's accounts, limits and charges still apply. The ZIP supplies reference files; each AI client has its own installation and file-handling features.

## Choose only what you need

| Package | Use it for | Requirements |
|---|---|---|
| [Skills and templates](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.4/chef-intelligence-skills-0.3.0-rc.4.zip) | 118 original skills, 24 guided journeys, seven blank reports and four plain menu layouts | An AI that accepts text or files |
| [Connected plugin](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.4/kitchen-tools-remote-plugin-0.3.0-rc.4.zip) | 21 public discovery, calculation and menu tools | A supported MCP client; see [compatibility evidence](docs/COMPATIBILITY.md) |
| [Local workspace](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases/download/v0.3.0-rc.4/open-kitchen-toolkit-0.3.0-rc.4.zip) | Private imports, linked drafts, approvals, tasks and enabled schedules | Node 24+ and the supplied Windows, macOS or Linux launcher |

Skills cover cooking, baking, menus, purchasing, inventory, costing, service, bar, people, events, marketing and care-kitchen screening against supplied approved requirements. [Purpose and coverage](docs/PRODUCT.md) · [Starter prompts](docs/GETTING_STARTED.md) · [Reference coverage](docs/KITCHEN_COVERAGE.json).

Use one skill at a time. Simple questions receive a direct answer; guided work asks only for the next necessary information. Uncovered questions can use the host AI's general knowledge or available research tools, labeled honestly. Suggested skills remain drafts until reviewed.

## Optional connected work

Public MCP endpoint: `https://culinaryos-kitchen-tools-production.up.railway.app/mcp` (no authentication). It is stateless and cannot read private workspaces. Merge the appropriate `clients/` fragment into your existing settings. Gemini CLI and the Gemini consumer website are different surfaces.

Try **“Use the toolkit to convert 32 ounces to pounds.”** The known result is **2 lb**. If a tool or permission is unavailable, the AI must report that status.

For private work, extract the full package and open the launcher in `launchers/`. Records default to your local application-data directory; `KITCHEN_WORKSPACE` selects another folder. Enabled schedules run while the workspace is open and perform bounded catch-up after reopening. No background model provider is included.

Five connected flows support recipe release, supplier price changes, daily service, event planning and service close. They link confirmed source versions, calculations, drafts and exact-revision approvals. Orders, messages, price changes and external report submissions require separately available tools and authorization.

The local MCP mode adds 24 private tools. `kitchen-tools-mcp --mode=public` is the default; `--mode=local --workspace /absolute/private/path` deliberately grants the selected AI client access to that workspace. Keep private connections private.

## One ecosystem, explicit handoffs

Chef Intelligence supplies the instructions and templates. CulinaryOS is an optional tenant-bound **file exchange** in this release; live sign-in/API synchronization remains deferred. [Ross Manor](docs/ROSS_MANOR_INTEGRATION.md) handles its separately authorized specialist paperwork and privacy/source-review gates. Installing both plugins does not authorize data sharing.

Missing prices, measurements, allergen states and facility requirements stay unresolved. Reports never invent temperatures, counts, observations or signatures. Allergen records distinguish **contains, may contain, verified absent and unknown**. Safety, legal and clinical questions require appropriate sources and authorized review.

## Release evidence and development

Version **0.3.0-rc.4** fixes the missing library and composer icon using the existing CulinaryOS brand asset. It is a release candidate. [Current acceptance](docs/ACCEPTANCE_030_RC4.md) records executed checks and limits. The [0.3.0-rc.2 comparison](docs/evidence/chef-paired-host-results-rc2.json) retains 17 paired host scenarios using AxomAI instructions versus original toolkit instructions; it is prior-version evidence, not an AxomAI-hosted inference or universal-reliability certification. The separate 624-case designed bank remains NOT_RUN.

```sh
npm ci
npm run typecheck
npm test
npm run check:scenarios
npm run test:release
npm run package
```

For source development, run `npm run start:local -- --workspace ./workspace` after building. [Connection and tool guidance](docs/CONNECTIONS.md) · [Original-content provenance](docs/PROVENANCE.md) · [Contribute a skill or report a problem](CONTRIBUTING.md).

Original toolkit code and skills are MIT licensed. Referenced third-party documents keep their own licenses. The hosted service has operating costs and no unlimited-service guarantee. Existing `kitchen-tools` identities and workflow IDs are preserved; Open Kitchen Toolkit remains a discovery alias. Older releases and their evidence remain in [release history](https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/releases).
