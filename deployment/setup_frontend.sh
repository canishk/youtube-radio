#!/usr/bin/env bash
set -euo pipefail
# Usage: sudo ./setup_frontend.sh /opt/u-tube-radio/frontend
TARGET_DIR=${1:-/opt/u-tube-radio/frontend}

echo "Preparing frontend in $TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"
sudo rsync -a --exclude='node_modules' --exclude='dist' ../frontend/ "$TARGET_DIR/"

cd "$TARGET_DIR"
if [ ! -d node_modules ]; then
  npm install
else
  npm ci || npm install
fi

npm run build

echo "Copying build to /var/www/u-tube-radio"
sudo mkdir -p /var/www/u-tube-radio
sudo rm -rf /var/www/u-tube-radio/*
sudo cp -r dist/* /var/www/u-tube-radio/

echo "Frontend build copied to /var/www/u-tube-radio"
echo "Enable the provided nginx site or adapt /etc/nginx/sites-available and restart nginx."
