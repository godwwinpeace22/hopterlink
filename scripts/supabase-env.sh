#!/usr/bin/env sh
set -eu

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "echo 'Missing $ENV_FILE' >&2"
  echo "return 1 2>/dev/null || exit 1"
  exit 1
fi

SUPABASE_URL=$(awk -F= '/^VITE_SUPABASE_URL[[:space:]]*=/{sub(/^[^=]*=/,""); gsub(/^"|"$|^'"'"'|'"'"'$/, ""); print; exit}' "$ENV_FILE")

if [ -z "${SUPABASE_URL:-}" ]; then
  echo "echo 'VITE_SUPABASE_URL is missing in $ENV_FILE' >&2"
  echo "return 1 2>/dev/null || exit 1"
  exit 1
fi

PROJECT_REF=$(printf "%s" "$SUPABASE_URL" | sed -n 's#https://\([a-z0-9-]*\)\.supabase\.co#\1#p')

if [ -z "${PROJECT_REF:-}" ]; then
  echo "echo 'Unable to derive project ref from VITE_SUPABASE_URL' >&2"
  echo "return 1 2>/dev/null || exit 1"
  exit 1
fi

printf 'export SUPABASE_PROJECT_REF=%s\n' "$PROJECT_REF"
printf 'echo "SUPABASE_PROJECT_REF set to %s"\n' "$PROJECT_REF"
