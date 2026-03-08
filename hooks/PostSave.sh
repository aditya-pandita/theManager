#!/usr/bin/env bash
# Fires after a ticket is saved/updated
PAYLOAD="$1"
echo "[PostSave] $(date -u +%Y-%m-%dT%H:%M:%SZ) payload=${PAYLOAD}" >> ~/.decidr-hooks.log
