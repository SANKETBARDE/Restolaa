from django.db import models


class Profile(models.Model):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    )

    id = models.UUIDField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'profiles'

    def __str__(self):
        return self.full_name


class RestaurantDetails(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=100)
    about = models.TextField(blank=True, null=True)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    opening_time = models.TimeField(blank=True, null=True)
    closing_time = models.TimeField(blank=True, null=True)
    logo_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'restaurant_details'

    def __str__(self):
        return self.name


class MenuCategory(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'menu_categories'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    id = models.UUIDField(primary_key=True)
    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.CASCADE,
        db_column='category_id',
        related_name='items'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'menu_items'

    def __str__(self):
        return self.name


class Order(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        db_column='user_id',
        blank=True,
        null=True
    )
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, default='pending')
    payment_status = models.CharField(max_length=20, default='pending')
    payment_method = models.CharField(max_length=50, default='cash')
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orders'

    def __str__(self):
        return self.customer_name


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        db_column='order_id',
        related_name='items'
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.SET_NULL,
        db_column='menu_item_id',
        blank=True,
        null=True
    )
    food_name = models.CharField(max_length=100)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'order_items'

    def __str__(self):
        return self.food_name


class TableReservation(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        db_column='user_id',
        blank=True,
        null=True
    )
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    reservation_date = models.DateField()
    reservation_time = models.TimeField()
    number_of_guests = models.IntegerField()
    special_request = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')
    admin_note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'table_reservations'


class EventBooking(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(
        Profile,
        on_delete=models.SET_NULL,
        db_column='user_id',
        blank=True,
        null=True
    )
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    event_type = models.CharField(max_length=100)
    event_date = models.DateField()
    event_time = models.TimeField()
    number_of_guests = models.IntegerField()
    food_package = models.CharField(max_length=100, blank=True, null=True)
    decoration_required = models.BooleanField(default=False)
    special_request = models.TextField(blank=True, null=True)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=30, default='pending')
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'event_bookings'


class Payment(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(Profile, on_delete=models.SET_NULL, db_column='user_id', blank=True, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, db_column='order_id', blank=True, null=True)
    reservation = models.ForeignKey(TableReservation, on_delete=models.SET_NULL, db_column='reservation_id', blank=True, null=True)
    event_booking = models.ForeignKey(EventBooking, on_delete=models.SET_NULL, db_column='event_booking_id', blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default='pending')
    transaction_id = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'payments'


class GalleryImage(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.TextField()
    image_type = models.CharField(max_length=30, default='restaurant')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gallery_images'
