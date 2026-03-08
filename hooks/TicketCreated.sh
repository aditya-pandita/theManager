#!/usr/bin/env bash
# Fires when a ticket is created
PAYLOAD="$1"
TICKET_ID=$(echo "$PAYLOAD" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "[TicketCreated] $(date -u +%Y-%m-%dT%H:%M:%SZ) id=${TICKET_ID}" >> ~/.decidr-hooks.log
