#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[musicplay] pulling latest code"
git pull --ff-only

echo "[musicplay] rebuilding containers"
sudo docker compose up -d --build

echo "[musicplay] service status"
sudo docker compose ps
