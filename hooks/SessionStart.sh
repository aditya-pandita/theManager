#!/usr/bin/env bash
# Fires when a new Decidr Code session starts
PAYLOAD="$1"
echo "[SessionStart] $(date -u +%Y-%m-%dT%H:%M:%SZ) payload=${PAYLOAD}" >> ~/.decidr-hooks.log
