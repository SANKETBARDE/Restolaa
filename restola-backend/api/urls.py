from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register('profiles', ProfileViewSet, basename='profile')
router.register('customers', ProfileViewSet, basename='customer')
router.register('restaurant-details', RestaurantDetailsViewSet, basename='restaurant-detail')
router.register('menu-categories', MenuCategoryViewSet, basename='menu-category')
router.register('menu-items', MenuItemViewSet, basename='menu-item')
router.register('orders', OrderViewSet, basename='order')
router.register('order-items', OrderItemViewSet, basename='order-item')
router.register('table-reservations', TableReservationViewSet, basename='table-reservation')
router.register('event-bookings', EventBookingViewSet, basename='event-booking')
router.register('payments', PaymentViewSet, basename='payment')
router.register('gallery-images', GalleryImageViewSet, basename='gallery-image')

urlpatterns = [
    path('', include(router.urls)),
]
