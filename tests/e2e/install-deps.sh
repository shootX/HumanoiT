#!/bin/bash
# E2E ბრაუზერის დამოკიდებულებები. გაუშვი როცა apt/dpkg ლოკი თავისუფალი იქნება:
#   sudo bash tests/e2e/install-deps.sh
set -e
apt-get update -qq
apt-get install -y \
  libx11-xcb1 libxrandr2 libxcomposite1 libxcursor1 \
  libxdamage1 libxfixes3 libxi6 libgtk-3-0 \
  libatk1.0-0 libatk-bridge2.0-0 libasound2
echo "Done. Run: npm run e2e"
