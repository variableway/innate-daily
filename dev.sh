#!/usr/bin/env bash
# 在 innate-daily 根目录启动 writing 静态站。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/../../pnpm-workspace.yaml" ]]; then
  cd "$ROOT/../.."
  exec pnpm --filter @innate/daily dev
fi

if [[ -x "$ROOT/node_modules/.bin/vite" ]]; then
  exec "$ROOT/node_modules/.bin/vite"
fi

echo "在 fe-templates 根先跑 pnpm install，或在本仓装好依赖后再 ./dev.sh。" >&2
exit 1
