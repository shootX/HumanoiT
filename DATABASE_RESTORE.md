# ბაზის აღდგენა

## ნაპოვნი ბექაპი

**ფაილი:** `/www/backup/database/database_20260210_184632.sql`  
**თარიღი:** 2026-02-10  
**ზომა:** ~676 KB  
**შინაარსი:** Humana Tasks CRM ბაზა – ცხრილები და მონაცემები (budget_categories, projects, users, invoices და ა.შ.)

---

## აღდგენის ნაბიჯები

### 1. ბაზის და მომხმარებლის შექმნა (aaPanel)

**aaPanel:** https://37.60.245.164:22409/

1. Database → Add database
2. **Database name:** `sql_humana_ge_space`
3. **Username:** `sql_humana_ge_space`
4. **Password:** იგივე რაც .env-ში DB_PASSWORD
5. **Access permission:** Local server (localhost)
6. Save

თუ ბაზა უკვე არსებობს მაგრამ ცარიელია – გამოტოვე ნაბიჯი 1 და გადადი ნაბიჯ 2-ზე.

### 2. აღდგენის სკრიპტის გაშვება

```bash
cd /www/wwwroot/crm.inexia.cc
chmod +x restore-database.sh
./restore-database.sh
```

### 3. ხელით იმპორტი (თუ სკრიპტი არ იმუშავა)

```bash
mysql -h localhost -u sql_humana_ge_space -p sql_humana_ge_space < /www/backup/database/database_20260210_184632.sql
```

ან **phpMyAdmin:** იმპორტი → ფაილის არჩევა → `database_20260210_184632.sql`

### 4. Laravel-ის შემოწმება

```bash
php artisan migrate:status
php artisan config:clear
php artisan cache:clear
```

---

## შენიშვნა

ბექაპი 2026-02-10-ისაა. 10 თებერვლის შემდეგ დამატებული მონაცემები აღარ იქნება აღდგენილი.

---

## მომავალი დაცვა

იხ. **DATA_PROTECTION.md** – სრული ანალიზი და რეკომენდაციები.
