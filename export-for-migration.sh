#!/bin/bash
set -e
cd "$(dirname "$0")"
[ ! -f .env ] && echo ".env არ არის" && exit 1
export $(grep -v '^#' .env | grep '^DB_' | xargs)
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="_migration_export"
mkdir -p "$OUT"
mysqldump -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers "$DB_DATABASE" > "$OUT/database_${STAMP}.sql"
tar --exclude='vendor' --exclude='node_modules' --exclude='.env' --exclude='_migration_export' --exclude='.git' -czf "$OUT/project_${STAMP}.tar.gz" .
# ასლი სერვერის ბექაპში – მონაცემების დაკარგვის თავიდან ასაცილებლად
mkdir -p /www/backup/database
cp "$OUT/database_${STAMP}.sql" "/www/backup/database/crm_${STAMP}.sql" 2>/dev/null || true
echo "$OUT/database_${STAMP}.sql"
echo "$OUT/project_${STAMP}.tar.gz"
