#!/bin/bash

pip install --no-cache-dir -r requirements.txt

python manage.py makemigrations user
python3 manage.py migrate

gunicorn --bind 0.0.0.0:8000 auth.wsgi:application
