#!/bin/bash

set -e

mkdir -p /app/data

if [ -z "$APP_ENV" ]; then
    export APP_ENV="production"
fi

if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="sqlite:////app/data/u_tube_radio.db"
fi

echo "APP_ENV=${APP_ENV}"
echo "DATABASE_URL=${DATABASE_URL}"

exec /usr/bin/supervisord \
    -c /etc/supervisor/conf.d/supervisord.conf
