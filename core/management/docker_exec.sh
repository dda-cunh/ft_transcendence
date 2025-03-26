#!/bin/bash

# Wait for the auth container to be up on port 8000
wait-for.sh auth 8000 -- echo "Auth is up!"

pip install --no-cache-dir -r requirements.txt

python manage.py makemigrations userManageApp
python3 manage.py migrate

gunicorn --bind 0.0.0.0:8000 managementProject.wsgi:application