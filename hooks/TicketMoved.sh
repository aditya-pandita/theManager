#!/usr/bin/env bash
# Fires when a ticket changes status column
PAYLOAD="$1"
echo "[TicketMoved] $(date -u +%Y-%m-%dT%H:%M:%SZ) payload=${PAYLOAD}" >> ~/.decidr-hooks.log
