#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[musicplay] pulling latest code"
git pull --ff-only

echo "[musicplay] rebuilding containers"
sudo docker compose up -d --build

echo "[musicplay] recreating nginx to refresh upstream routing"
sudo docker compose up -d --force-recreate nginx

echo "[musicplay] service status"
sudo docker compose ps
