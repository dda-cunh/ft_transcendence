#!/bin/bash

pip install --no-cache-dir -r requirements.txt

export DJANGO_SETTINGS_MODULE=ServerPong.settings
python3 manage.py migrate

daphne --bind 0.0.0.0 --port 8000 ServerPong.asgi:application
