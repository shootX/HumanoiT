# E2E ტესტები (Playwright)

საიტის ფუნქციონალის შემოწმება: ავტორიზაცია, ნავიგაცია, ინვოისები, Settings. ყოველი ნაბიჯის შედეგი იწერება ლოგში.

**Linux-ზე (სერვერი):** შეცდომა `libatk-1.0.so.0: cannot open shared object file` – სერვერზე არ არის Playwright-ის ბრაუზერის ბიბლიოთეკები.

1. თუ `apt` ლოკი თავისუფალია (არაფერი არ აწვება `apt-get`/`update`):
   ```bash
   sudo bash tests/e2e/install-deps.sh
   ```
2. თუ ლოკს იჭერს პროცესი (მაგ. `E: Could not get lock... process 3366`):
   - დაელოდე სანამ გაეშვება `apt-get`/`unattended-upgrade`, ან
   - თუ 3366 „ჩაჭედილი“ არის: `sudo kill 3366` → `sudo dpkg --configure -a` → `sudo bash tests/e2e/install-deps.sh`

შემდეგ: `npm run e2e`

## გაშვება

```bash
npm run e2e
```

ლოგის ნახვა გაშვების შემდეგ:

```bash
cat tests/e2e/logs/e2e-run.log
```

ან ერთი ბრძანებით (ტესტები + ლოგი):

```bash
npm run e2e:log
```

## ცვლადები

- `BASE_URL` ან `APP_URL` – საიტის მისამართი (default: https://crm.inexia.cc)
- `E2E_LOGIN_EMAIL` – ლოგინის email (default: company@example.com)
- `E2E_LOGIN_PASSWORD` – პაროლი (default: password)

მაგალითი:

```bash
E2E_LOGIN_EMAIL=admin@site.com E2E_LOGIN_PASSWORD=secret npm run e2e
```

## ლოგის მისამართი

`tests/e2e/logs/e2e-run.log`
