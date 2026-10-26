#!/bin/sh
set -eu
command -v node >/dev/null 2>&1 || { printf '%s\n' 'Install Node.js 24 or later from https://nodejs.org, then rerun this launcher.'; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<24)process.exit(1)' || { printf '%s\n' 'Node.js 24 or later is required.'; exit 1; }
KITCHEN_PACKAGE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$KITCHEN_PACKAGE_ROOT"
if [ ! -d node_modules/@modelcontextprotocol/sdk ]; then
  printf '%s\n' 'Installing locked runtime dependencies; kitchen records stay outside this folder.'
  npm ci --omit=dev --no-audit --no-fund
fi
KITCHEN_SELECTED_WORKSPACE=${KITCHEN_WORKSPACE:-${XDG_DATA_HOME:-$HOME/.local/share}/OpenKitchenToolkit}
printf '%s\n' 'Open http://127.0.0.1:3101. Keep this workspace running for enabled schedules.'
exec node dist/cli/cli.js local-serve --workspace "$KITCHEN_SELECTED_WORKSPACE"
