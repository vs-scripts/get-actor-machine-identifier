#!/usr/bin/env sh
set -eu

# Session-local Node activation for this repo
# - Prepends a project-local Node distribution under tests/tools/node
# - Does not modify global PATH
# - Enforces an exact Node version (strict)

EXPECTED_NODE_VERSION="v24.12.0"

# Resolve repo root relative to this script
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
TOOLS_ROOT="$REPO_ROOT/tests/tools/node"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux) OS="linux" ;;
  darwin) OS="darwin" ;;
  *) echo "Unsupported OS for use-node.sh: $OS" >&2; exit 1 ;;
esac

case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported arch for use-node.sh: $ARCH" >&2; exit 1 ;;
esac

NODE_HOME="$TOOLS_ROOT/$OS-$ARCH"
NODE_BIN="$NODE_HOME/bin"

if [ ! -x "$NODE_BIN/node" ]; then
  echo "Node not found at $NODE_BIN/node" >&2
  echo "Expected layout: tests/tools/node/$OS-$ARCH/bin/node" >&2
  exit 1
fi

# IMPORTANT: this script must be sourced to affect the current shell
#   . ./tests/scripts/use-node.sh
export PATH="$NODE_BIN:$PATH"

ACTUAL_NODE_VERSION="$(node -v | tr -d '\r')"
if [ "$ACTUAL_NODE_VERSION" != "$EXPECTED_NODE_VERSION" ]; then
  echo "Unexpected Node version: $ACTUAL_NODE_VERSION (expected $EXPECTED_NODE_VERSION)" >&2
  exit 1
fi

NPM_VERSION="$(npm -v | tr -d '\r')"
echo "Using node $ACTUAL_NODE_VERSION (npm $NPM_VERSION) from $NODE_HOME"