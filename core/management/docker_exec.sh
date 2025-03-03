#!/bin/bash

apt-get update && apt-get install -y zlib1g-dev libjpeg-dev

pip install --no-cache-dir -r requirements.txt

python3 manage.py makemigrations userManageApp
python3 manage.py migrate

gunicorn --bind 0.0.0.0:8000 managementProject.wsgi:application
