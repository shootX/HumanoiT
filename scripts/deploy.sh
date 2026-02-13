#!/bin/bash
set -e
cd /www/wwwroot/crm.inexia.cc
git pull origin main 2>/dev/null || git pull origin master
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
