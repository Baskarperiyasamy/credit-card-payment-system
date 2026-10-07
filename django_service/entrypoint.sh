#!/bin/sh
set -e

echo "Applying migrations..."
i=0
until python manage.py migrate --noinput; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then echo "Database never became ready"; exit 1; fi
  echo "Waiting for database..."
  sleep 3
done

python manage.py create_admin
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
