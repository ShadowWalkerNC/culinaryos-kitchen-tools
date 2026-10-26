# Connect your AI

Step-by-step setup and CLI commands: [QUICK_START.md](QUICK_START.md).

Public hosted URL: https://culinaryos-kitchen-tools-production.up.railway.app/mcp. Choose no authentication where supported. No additional toolkit login or model key. Your AI-client plan and workspace rules still apply.

Client fragments live in clients/. Current official references: [ChatGPT](https://developers.openai.com/api/docs/guides/custom-mcp-server), [Claude](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Cursor install links](https://prod.cursor.com/docs/mcp/install-links), [Gemini CLI](https://geminicli.com/docs/tools/mcp-server/). Checked2026-10-25; consult current host rules when installing. Gemini consumer website support is not inferred from Gemini CLI.

The portable plugin ZIP contains the73 original skills and public remote connection. The full source/runtime ZIP adds the private local workspace, launchers and tests. Public directory approval is separate from downloadable installation. The existing creator plugin remains private with the same identity and is not a universal public install link.

For local clients, set command to node and args to the absolute dist/mcp/stdio.js path, --mode=local, --workspace and an absolute selected workspace path. Default --mode=public has no private database. Use only supported local-host surfaces. Never expose local mode to the internet or assume a remote web client can reach files on your computer.

Public tools: list_capabilities, list_workflows, get_workflow, validate_kitchen_data, scale_recipe, convert_quantity, cost_recipe, compare_purchase_costs, build_prep_plan, build_order_proposal, calculate_usable_yield, reconcile_stock, calculate_event_budget, validate_prep_capacity.

list_workflows supports query, zone, offset and limit. get_workflow accepts name plus optional profile {country,region,currency,unitSystem,timezone,foodCostTargetPercent}; absent settings stay unresolved. Existing IDs and baseline aliases resolve to canonical workflows.

Local connected tools: run_connected_flow takes {request:{kind,key,...flowInputs}}, list_connected_flows takes {}, attach_flow_document takes {id,expectedVersion,kind,title,body}, approve_flow takes {id,expectedVersion,confirm:true,reviewer}, get_restaurant_profile takes {}, set_restaurant_profile takes explicit profile fields, worker_status takes {}. Existing import/task/approval/export tools remain. The local HTTP equivalents accept flat flow requests at /api/connected-flows and mutations require the local session token.

Flow kinds: recipe-release {recipeId}; supplier-price-change {ingredientIds}; daily-service {day,capacity?,orderLines?}; event-planning {budget,capacity,dietary}; service-close {day,stock,wasteConfirmed,waste}. Same kind/key/input is idempotent. Reusing a key with changed inputs is rejected. Required documents: recipe-card+sop for recipe release, service-brief for daily service, event-plan for events. Blocked/stale runs cannot be approved.

Daily capacity uses explicitly supplied resources [{id,capacity,unit}] and tasks [{id,resourceId,start,end,units,unit}], with ISO timestamps including timezone offset. Ordering lines need ingredientId,par,onHand,onOrder,unit and optional measured packSize. No extra capacity, stock or safety buffer is assumed.

Event budgets require explicit currency, revenueCents or null, cost lines {label,currency,amountCents:number|null}, and optional targetContributionPercent as decimal text. Unknown costs block complete contribution/target pricing. Guest-level records use id,requirements,allergenStatus; non-unknown states additionally require evidence {source,version,reviewer}. All guest confirmations must be accounted for before approval. Stock reconciliation uses lines {id,unit,opening,received,used,waste,closing}; each quantity is {amount:string,unit} or null for unknown.

To verify a connection, discover14 public tools, retrieve recipe-costing, convert32oz to2lb and run the synthetic costing example. Public discovery must not contain commit_import or run_connected_flow. See COMPATIBILITY.md for which client installations were actually exercised.
