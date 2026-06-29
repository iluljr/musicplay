#!/bin/sh
set -eu

DOMAIN="${MUSICPLAY_DOMAIN:-live.digitalmfa.com}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
TEMPLATE_DIR="/etc/musicplay/templates"
TARGET_CONFIG="/etc/nginx/conf.d/default.conf"

mkdir -p /var/www/certbot/.well-known/acme-challenge
printf 'ok' > /var/www/certbot/.well-known/acme-challenge/health

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
  cp "${TEMPLATE_DIR}/musicplay.https.conf" "${TARGET_CONFIG}"
else
  cp "${TEMPLATE_DIR}/musicplay.http.conf" "${TARGET_CONFIG}"
fi

exec nginx -g 'daemon off;'
