#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PID_FILE="${PID_FILE:-npm-start.pid}"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if ps -p "$PID" > /dev/null 2>&1; then
    kill "$PID" || true
    sleep 1
    if ps -p "$PID" > /dev/null 2>&1; then
      kill -9 "$PID" || true
    fi
    echo "Stopped PID $PID"
  fi
  rm -f "$PID_FILE"
else
  pkill -f "react-scripts start" || true
fi
