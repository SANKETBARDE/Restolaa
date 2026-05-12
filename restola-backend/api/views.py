from rest_framework import viewsets
from .models import *
from .serializers import *


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all().order_by('-created_at')
    serializer_class = ProfileSerializer


class RestaurantDetailsViewSet(viewsets.ModelViewSet):
    queryset = RestaurantDetails.objects.all()
    serializer_class = RestaurantDetailsSerializer


class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all().order_by('name')
    serializer_class = MenuCategorySerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all().order_by('name')
    serializer_class = MenuItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        queryset = OrderItem.objects.all().order_by('-created_at')
        order_id = self.request.query_params.get('order')
        if order_id:
            queryset = queryset.filter(order__id=order_id)
        return queryset


class TableReservationViewSet(viewsets.ModelViewSet):
    queryset = TableReservation.objects.all().order_by('-created_at')
    serializer_class = TableReservationSerializer
    serializer_class = TableReservationSerializer


class EventBookingViewSet(viewsets.ModelViewSet):
    queryset = EventBooking.objects.all().order_by('-created_at')
    serializer_class = EventBookingSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer


class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-created_at')
    serializer_class = GalleryImageSerializer
