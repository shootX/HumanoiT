# მონაცემების დაცვა – სრული ანალიზი

## ნაპოვნი ბექაპები

| ფაილი | თარიღი | ზომა | შინაარსი |
|-------|--------|------|----------|
| `/www/backup/database/database_20260210_184632.sql` | 2026-02-10 | 676 KB | **CRM ბაზა** (huma_tasky → sql_humana_ge_space) |
| `/www/backup/backup_restore/1773045480_backup/database/mysql/sql_inexia_cc.sql` | 2026-03-09 | 1.4 KB | inexia.cc – ცარიელი |
| `/www/backup/backup_restore/1773045480_backup/database/mysql/sql_car_inexia_cc.sql` | 2026-03-09 | 125 MB | car.inexia.cc – არა CRM |

---

## პრობლემა: CRM ბაზა არ არის aaPanel ბექაპში

**aaPanel Backup Task** (2026-03-09) იგნორირებს `sql_humana_ge_space`-ს:

- ბექაპში მხოლოდ: sql_inexia_cc, autolime, sql_car_inexia_cc, sql_mail__77ndtk
- **sql_humana_ge_space არ არის** პანელის Database სიაში ან ბექაპის ტასკში

**crm.inexia.cc საიტის ბექაპი:** status=0 (წარუმატებელი)

---

## რა უნდა გაკეთდეს – მომავალი დაკარგვის თავიდან ასაცილებლად

### 1. aaPanel-ში CRM ბაზის დამატება ბექაპში

1. aaPanel → **Backup** → Backup task
2. Edit → **Database** სექცია
3. დაამატე `sql_humana_ge_space` (თუ პანელში რეგისტრირებულია)
4. თუ არა: Database → Add database → შექმენი იგივე სახელით და მომხმარებლით

### 2. ავტომატური ყოველდღიური ბექაპი (cron)

```bash
# ყოველდღე 03:00-ზე
0 3 * * * cd /www/wwwroot/crm.inexia.cc && ./export-for-migration.sh > /dev/null 2>&1 && cp _migration_export/database_*.sql /www/backup/database/crm_$(date +\%Y\%m\%d).sql 2>/dev/null || true
```

### 3. export-for-migration.sh გაუმჯობესება

დამატება სკრიპტის ბოლოში – ბექაპის ასლი სერვერის ფოლდერში:

```bash
# ასლი სერვერის ბექაპში
cp "$OUT/database_${STAMP}.sql" /www/backup/database/crm_${STAMP}.sql 2>/dev/null || true
```

---

## სად არის მონაცემები

| წყარო | CRM მონაცემები |
|-------|----------------|
| GitHub | ❌ არა (.gitignore _migration_export) |
| Excel Export (invoices, projects...) | ❌ ნაწილობრივი, არა სრული ბაზა |
| export-for-migration.sh | ✅ ქმნის dump-ს, მაგრამ _migration_export იგნორირებულია Git-ში |
| aaPanel Backup | ❌ sql_humana_ge_space არ არის ტასკში |
| /www/backup/database/ | ✅ database_20260210_184632.sql – ერთადერთი სრული ბექაპი |

---

## ისტორია (პანელის ლოგებიდან)

2026-02-10 20:56 – `database_20260210_184632.sql` იმპორტირდა `sql_humana_ge_space`-ში პანელის InputSql-ით.

---

## აღდგენილი მონაცემები (2026-03-09)

| წყარო | რაოდენობა | ბრძანება |
|-------|-----------|----------|
| `storage/report - 2026-03-02T174037.989.xls` | 1 ინვოისი, 12 ნივთი, 325.15 ლარი | `php artisan purchase-report:import-from-file "storage/report - 2026-03-02T174037.989.xls" --project=1 --workspace=2` |

**Google Sheets (tasks):** თუ `GOOGLE_SHEETS_CREDENTIALS_JSON` დააყენებულია `.env`-ში და Sheet გაზიარებულია Service Account-თან → `php artisan tasks:sync-from-google-sheet "1TIislBCEcpUQM2ctN7q4hg6VW8lZyuC0G71dbeq2RlE" 1 --user=1`
