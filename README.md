# Taskly CRM

CRM სისტემა პროექტების, ამოცანების, აქტივების და ბიზნეს პროცესების მართვისთვის.

## ტექნოლოგიები

- **Backend:** Laravel, PHP
- **Frontend:** React, Inertia.js, TypeScript, Tailwind CSS
- **ბაზა:** MySQL

## ფუნქციონალი

- **პროექტები** – შექმნა, რედაქტირება, ბიუჯეტი, მილსტოუნები
- **ამოცანები** – Task stages, კომენტარები, ჩეკლისტები
- **აქტივები** – აქტივების მართვა, კატეგორიები, Excel export/import (ქართული)
- **Bugs** – ბაგების მიკვლევა, სტატუსები
- **Timesheets** – დროის აღრიცხვა
- **ინვოისები** – ინვოისების მართვა
- **კომპანიები და Workspaces** – მრავალკომპანიური რეჟიმი

## აქტივების მოდული (განახლება 2026-02-14)

- **კატეგორიების მართვა** – დამატება, რედაქტირება, წაშლა, drag & drop რეორდერი
- **სიის ხედი** – ცხრილი 30 ჩანაწერით გვერდზე
- **Excel Export** – ქართულენოვანი სათაურებით
- **Excel Import** – ნიმუშის ჩამოტვირთვა, სვეტების მიბმა, იმპორტი

## ინსტალაცია

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
npm run build
```

## გაშვება

```bash
php artisan serve
npm run dev
```
