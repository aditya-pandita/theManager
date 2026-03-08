#!/usr/bin/env bash
set -e

TRIPLE=$(rustc -vV | grep host | cut -d' ' -f2)
OUTPUT="../src-tauri/binaries/decidr-code-sidecar-${TRIPLE}"

echo "Building sidecar for ${TRIPLE}..."
npx pkg dist/index.js --target node18 --output "${OUTPUT}"
echo "Sidecar built: ${OUTPUT}"
