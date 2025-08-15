#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-3000}"
LOG_FILE="${LOG_FILE:-npm-start.log}"
PID_FILE="${PID_FILE:-npm-start.pid}"

if [ -f "$PID_FILE" ] && ps -p "$(cat "$PID_FILE")" > /dev/null 2>&1; then
  echo "Already running (PID $(cat "$PID_FILE"))."
  exit 0
fi

nohup env PORT="$PORT" npm start > "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE"
echo "Started on :$PORT (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
