#!/usr/bin/env bash

set -e

HOST="$1"
PORT="$2"
shift 2
CMD="$@"

>&2 echo "Waiting for $HOST:$PORT to be ready..."

# Loop until we can connect
while ! nc -z "$HOST" "$PORT"; do
  sleep 1
done

>&2 echo "$HOST:$PORT is up! Executing command..."
exec $CMD
