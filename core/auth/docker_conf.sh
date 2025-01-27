echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn server on port $AUTH_PY_SERV_PORT..."
gunicorn -w 4 -b "0.0.0.0:$AUTH_PY_SERV_PORT" auth.wsgi:application
