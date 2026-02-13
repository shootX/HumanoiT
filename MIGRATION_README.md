# პროექტის გადატანა ახალ სერვერზე

## მიმდინარე სერვერზე (გაშვება)

```bash
cd /path/to/public_html
chmod +x export-for-migration.sh
./export-for-migration.sh
```

შეიქმნება `_migration_export/`:
- `database_<DB_NAME>_<timestamp>.sql` — ბაზის dump
- `project_<timestamp>.tar.gz` — პროექტის ფაილები (vendor, node_modules, .env გარეშე)

გადაიტანე ორივე ფაილი ახალ სერვერზე.

---

## ახალ სერვერზე

### 1. პროექტის გაშლა

```bash
mkdir -p /path/to/new/public_html
tar -xzf project_*.tar.gz -C /path/to/new/public_html
cd /path/to/new/public_html
```

### 2. .env

```bash
cp .env.example .env
# რედაქტირება: DB_*, APP_URL, ASSET_URL, APP_KEY
php artisan key:generate
```

### 3. ბაზა

MySQL-ში შექმენი ცარიელი ბაზა, შემდეგ:

```bash
mysql -u USER -p DATABASE_NAME < /path/to/database_*.sql
```

ან .env-ში მითითებული DB_* პარამეტრებით:

```bash
mysql -h DB_HOST -u DB_USERNAME -p DB_DATABASE < _migration_export/database_*.sql
```

(სადაც _migration_export არის ის დირექტორია, სადაც გადაიტანე sql ფაილი.)

### 4. დამოკიდებულებები

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

### 5. Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
# ვებ-სერვერის მომხმარებელი უნდა იყოს storage/bootstrap/cache მფლობელი
```

### 6. storage link (თუ არ არის)

```bash
php artisan storage:link
```

---

## შენიშვნა

- `vendor/` და `node_modules/` ახალ სერვერზე ისევ დააყენებს `composer install` და `npm ci`.
- `.env` არ შედის არქივში — ახალ სერვერზე უნდა შექმნა `.env.example`-დან.
