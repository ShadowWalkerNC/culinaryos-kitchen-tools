# CulinaryOS file adapter

The v1 adapter reads an operator-authorized portable exchange file inside the selected workspace. It does not claim a native CulinaryOS API/export route exists, use existing privileged MCP credentials, or write to CulinaryOS.

Envelope: `{ "tenantId": "explicit-tenant", "dataVersion": "v1", "recipes": [], "purchases": [] }`. Recipe and purchase records use the validated toolkit schema described in TECHNICAL_REQUIREMENTS.md. Every optional per-record tenant identity must agree with the envelope and supplied binding. Invalid records, cross-tenant records, duplicates, oversize files and path escapes are rejected.

CulinaryOS RecipeBlueprint ratios are not ingredient weights, and its documented `costPerUnit` does not by itself establish dollars versus cents or a purchase unit basis. Those records must first be scaled to explicit quantities and mapped to explicit currency/minor-unit costs. The adapter deliberately does not guess that conversion.

Copy the selected authorized file into your workspace and call the CLI `read-culinaryos` command with tenant, file and confirmation. Review the returned normalized records, then use preview_import/commit_import in the local workspace. No import approval is a CulinaryOS write authorization.

Live authenticated CulinaryOS integration and production acceptance remain NOT RUN. No CulinaryOS source was edited during this implementation.
