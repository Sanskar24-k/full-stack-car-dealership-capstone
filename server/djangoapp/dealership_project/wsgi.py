"""WSGI config for the dealership project."""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dealership_project.settings")
application = get_wsgi_application()
