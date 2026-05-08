"""Create admin user in database - Run this script"""
import os
import sys

# Add the backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'restola-backend')
sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
email = 'admin@restola.com'
password = 'admin123'

if User.objects.filter(username=username).exists():
    print(f"User {username} exists. Updating...")
    user = User.objects.get(username=username)
else:
    print(f"Creating new user {username}...")
    user = User(username=username, email=email, first_name='Admin', last_name='User')

user.is_staff = True
user.is_superuser = True
user.set_password(password)
user.save()

print(f"✓ Admin user ready")
print(f"✓ Username: {username}")
print(f"✓ Email: {email}")
print(f"✓ Password: {password}")
print("\nGo to http://localhost:5174/admin/login to login")
print("\nNOTE: Frontend sends 'email' field, so either:")
print("  1. Login with username 'admin' and password 'admin123' via API directly")
print("  2. Or modify frontend to send username instead of email")
