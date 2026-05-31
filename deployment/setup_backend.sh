#!/usr/bin/env bash
set -euo pipefail
# Usage: sudo ./setup_backend.sh /opt/u-tube-radio/backend
TARGET_DIR=${1:-/opt/u-tube-radio/backend}

echo "Installing backend into $TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"
sudo rsync -a --exclude='.venv' --exclude='__pycache__' ../backend/ "$TARGET_DIR/"

cd "$TARGET_DIR"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Copied .env.example to .env — edit $TARGET_DIR/.env before starting the service"
fi

echo "To enable the systemd service, run as root or with sudo:"
echo "  sudo cp ../deployment/uvicorn.service /etc/systemd/system/u-tube-radio.service"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable --now u-tube-radio.service"

echo "Backend setup complete. Edit the .env file and then enable the service as shown above."
