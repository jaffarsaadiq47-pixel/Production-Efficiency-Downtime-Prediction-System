#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
# Commands moved to render.yaml:
# python manage.py collectstatic --noinput
# python manage.py migrate
