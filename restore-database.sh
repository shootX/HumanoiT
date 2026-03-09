#!/bin/bash
# ბაზის აღდგენა ბექაპიდან
# წყარო: /www/backup/database/database_20260210_184632.sql (2026-02-10)

set -e
cd "$(dirname "$0")"
[ ! -f .env ] && echo "შეცდომა: .env არ არის" && exit 1

source .env 2>/dev/null || export $(grep -v '^#' .env | grep '^DB_' | xargs)

BACKUP="/www/backup/database/database_20260210_184632.sql"
if [ ! -f "$BACKUP" ]; then
    echo "შეცდომა: ბექაპი ვერ მოიძებნა: $BACKUP"
    exit 1
fi

echo "ბექაპი: $BACKUP"
echo "ბაზა: ${DB_DATABASE:-?}"
echo "ჰოსტი: ${DB_HOST:-localhost}"
echo ""
echo "იმპორტი იწყება..."
mysql -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$BACKUP"
echo "ბაზა წარმატებით აღდგენილია."
