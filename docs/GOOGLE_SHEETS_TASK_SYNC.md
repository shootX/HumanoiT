# Google Sheets – ტასკების სინქრონიზაცია

Google Sheet-ის ცხრილიდან ტასკები იმპორტირდება/იგზავნება პროექტში და განახლებები აისახება პლატფორმაზე.

**ამ ფაილის მაგალითი:**  
`https://docs.google.com/spreadsheets/d/1TIislBCEcpUQM2ctN7q4hg6VW8lZyuC0G71dbeq2RlE/edit`  
→ Spreadsheet ID: `1TIislBCEcpUQM2ctN7q4hg6VW8lZyuC0G71dbeq2RlE`

## 1. Google Cloud – Service Account

1. გადადი [Google Cloud Console](https://console.cloud.google.com/) → პროექტი (ან ახალი).
2. **APIs & Services** → **Library** → მოძებნე **Google Sheets API** → **Enable**.
3. **APIs & Services** → **Credentials** → **Create Credentials** → **Service account**.
4. შექმნის შემდეგ დააჭირე Service account-ს → **Keys** → **Add Key** → **Create new key** → **JSON**. ჩამოიწერება JSON ფაილი.
5. ამ JSON ფაილის სრული გზა ჩაწერე `.env`-ში:
   ```env
   GOOGLE_SHEETS_CREDENTIALS_JSON=/www/wwwroot/crm.inexia.cc/storage/app/google-sheets-service-account.json
   ```
   (ფაილი შეგიძლია იმავე პროექტის `storage/app/`-ში ან სხვა უსაფრთხო ადგილას დააყენო.)

6. **Google Sheet-ის გაზიარება:** Sheet-ის ფაილში **Share** → დაამატე **Service account-ის email** (JSON-ში ველი `client_email`, მაგ. `xxx@yyy.iam.gserviceaccount.com`) **Viewer** ან **Editor**-ად.

## 2. Sheet-ის ფორმატი და ლოგიკა „მაღაზია“

**ფურცლის tab-ის სახელი:** `ია` (არ იყენება Sheet1).

პირველი რიგი – სათაურები. **მაღაზია** სვეტი განსაზღვრავს პროექტს: თუ უჯრაში წერია **ვარკეთილი**, ტასკი მიდის იმ პროექტში, რომელიც პლატფორმაზე ჰქვია **ვარკეთილის ფილიალი** (ან რომლის სახელშიც შედის „ვარკეთილი“). ანალოგიურად სხვა მაღაზიები.

მაგალითი:

| მაღაზია    | Title / სათაური | Description | Priority | Due Date | Taskly ID |
|------------|-----------------|-------------|----------|----------|-----------|
| ვარკეთილი  | Task one        | Details…    | high     | 2026-02-15 |          |
| დიღომი     | Task two        | …           | medium   | 2026-02-20 | 5         |

- **მაღაზია** – პროექტის გარჩევა: მნიშვნელობა „X“ → პროექტი „X ფილიალი“ ან სახელში „X“.
- **Title / სათაური** – სავალდებულო.
- **Description, Priority, Due Date** – არასავალდებულო.
- **Taskly ID** – არასავალდებულო; თუ არის, ტასკი განახლდება.

პროექტები Taskly-ში უნდა იყოს სახელებით მაგ. „ვარკეთილის ფილიალი“, „დიღომის ფილიალი“ (ან სახელში შესაბამისი მაღაზიის სახელი).

## 3. ბრძანების გაშვება

Spreadsheet ID იღება Sheet-ის URL-დან:
`https://docs.google.com/spreadsheets/d/ **SPREADSHEET_ID** /edit`

```bash
cd /www/wwwroot/crm.inexia.cc

# ამ ფაილისთვის: workspace_id 1, ფურცელი "ია", მომხმარებელი 1
php artisan tasks:sync-from-google-sheet "1TIislBCEcpUQM2ctN7q4hg6VW8lZyuC0G71dbeq2RlE" 1 --user=1
```

- **workspace_id** – Taskly-ში workspace-ის ID; პროექტი ყოველ რიგზე განისაზღვრება სვეტით „მაღაზია“.
- **--sheet** – ფურცლის tab-ის სახელი, ნაგულისხმევი **ია**.
- **--project** – (არასავალდებულო) როცა რიგში არ არის „მაღაზია“ ან პროექტი ვერ მოიძებნა, გამოიყენება ეს project ID.
- **--user** – მომხმარებლის ID ტასკის `created_by`-სთვის.

## 4. ავტომატური სინქრონიზაცია (cron)

```bash
# ყოველ 15 წუთში (ამ Sheet-ისა, workspace 1)
*/15 * * * * cd /www/wwwroot/crm.inexia.cc && php artisan tasks:sync-from-google-sheet "1TIislBCEcpUQM2ctN7q4hg6VW8lZyuC0G71dbeq2RlE" 1 --user=1 >> /tmp/sheet-sync.log 2>&1
```

შეცვალე workspace_id ან --project თუ სჭირდება.

## 5. ლოგირება

შეცდომები იწერება Laravel ლოგში (`storage/logs/laravel.log`) და ბრძანების გამოტანაში (created/updated/errors).
