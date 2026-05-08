from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Customer

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            default='admin@restola.com',
            help='Admin email address',
        )
        parser.add_argument(
            '--password',
            default='admin123',
            help='Admin password',
        )
        parser.add_argument(
            '--first-name',
            default='Admin',
            help='First name',
        )
        parser.add_argument(
            '--last-name',
            default='User',
            help='Last name',
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists. Updating to admin...')
            )
            user = User.objects.get(email=email)
            user.is_staff = True
            user.is_superuser = True
            user.role = 'admin'
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated user {email} as admin'))
        else:
            # Create new admin user
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            user.role = 'admin'
            user.save()
            
            # Also create as customer for API consistency
            Customer.objects.get_or_create(
                user=user,
                defaults={
                    'phone': '+1234567890'
                }
            )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {email}'))
            self.stdout.write(f'Password: {password}')
