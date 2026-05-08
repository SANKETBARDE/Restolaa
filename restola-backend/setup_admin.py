#!/usr/bin/env python
"""
Setup script to create admin user in database.
Run this to create the demo admin user.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from api.models import Customer

User = get_user_model()

def create_admin_user():
    email = 'admin@restola.com'
    password = 'admin123'
    
    # Check if user exists
    if User.objects.filter(email=email).exists():
        print(f"User {email} already exists. Updating to admin...")
        user = User.objects.get(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.role = 'admin'
        user.set_password(password)
        user.save()
        print(f"✓ Updated {email} as admin")
    else:
        # Create new admin
        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
        )
        user.role = 'admin'
        user.save()
        
        # Create customer record
        Customer.objects.get_or_create(
            user=user,
            defaults={'phone': '+1234567890'}
        )
        
        print(f"✓ Created admin user: {email}")
        print(f"✓ Password: {password}")
    
    print("\nYou can now login at /admin/login with these credentials")
    return True

if __name__ == '__main__':
    try:
        create_admin_user()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
