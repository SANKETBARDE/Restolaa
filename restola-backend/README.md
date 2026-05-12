# Restolaa Flask Backend

A lightweight Flask backend for the Restolaa restaurant management system, integrated with Supabase.

## Setup

1. Create and activate a virtual environment:
```bash
cd restola-backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure your `.env` file is configured:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

## Running the Backend

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

All endpoints return data in the format: `{ "results": [...], "count": N }`

### Profiles/Customers
- `GET /api/profiles/` - List all profiles
- `POST /api/profiles/` - Create a profile
- `GET /api/profiles/<id>/` - Get a profile
- `PUT /api/profiles/<id>/` - Update a profile
- `DELETE /api/profiles/<id>/` - Delete a profile
- `GET /api/customers/` - Alias for profiles

### Restaurant Details
- `GET /api/restaurant-details/` - Get restaurant details
- `POST /api/restaurant-details/` - Create restaurant details
- `GET /api/restaurant-details/<id>/` - Get specific details
- `PUT /api/restaurant-details/<id>/` - Update details

### Menu Categories
- `GET /api/menu-categories/` - List categories
- `POST /api/menu-categories/` - Create category
- `GET /api/menu-categories/<id>/` - Get category
- `PUT /api/menu-categories/<id>/` - Update category
- `DELETE /api/menu-categories/<id>/` - Delete category

### Menu Items
- `GET /api/menu-items/` - List items (includes category_name)
- `POST /api/menu-items/` - Create item
- `GET /api/menu-items/<id>/` - Get item
- `PUT /api/menu-items/<id>/` - Update item
- `DELETE /api/menu-items/<id>/` - Delete item

### Orders
- `GET /api/orders/` - List orders with items
- `POST /api/orders/` - Create order with items
- `GET /api/orders/<id>/` - Get order with items
- `PUT /api/orders/<id>/` - Update order
- `DELETE /api/orders/<id>/` - Delete order

### Order Items
- `GET /api/order-items/` - List order items
- `GET /api/order-items/<id>/` - Get order item
- `PUT /api/order-items/<id>/` - Update order item

### Table Reservations
- `GET /api/table-reservations/` - List reservations
- `POST /api/table-reservations/` - Create reservation
- `GET /api/table-reservations/<id>/` - Get reservation
- `PUT /api/table-reservations/<id>/` - Update reservation
- `DELETE /api/table-reservations/<id>/` - Delete reservation

### Event Bookings
- `GET /api/event-bookings/` - List bookings
- `POST /api/event-bookings/` - Create booking
- `GET /api/event-bookings/<id>/` - Get booking
- `PUT /api/event-bookings/<id>/` - Update booking
- `DELETE /api/event-bookings/<id>/` - Delete booking

### Payments
- `GET /api/payments/` - List payments
- `POST /api/payments/` - Create payment
- `GET /api/payments/<id>/` - Get payment
- `PUT /api/payments/<id>/` - Update payment
- `DELETE /api/payments/<id>/` - Delete payment

### Gallery Images
- `GET /api/gallery-images/` - List images
- `POST /api/gallery-images/` - Create image
- `GET /api/gallery-images/<id>/` - Get image
- `PUT /api/gallery-images/<id>/` - Update image
- `DELETE /api/gallery-images/<id>/` - Delete image

### Health Check
- `GET /api/health/` - Check backend status
