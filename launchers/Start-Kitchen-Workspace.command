#!/bin/sh
set -eu
KITCHEN_LAUNCHER_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec sh "$KITCHEN_LAUNCHER_DIR/start-kitchen-workspace.sh"
