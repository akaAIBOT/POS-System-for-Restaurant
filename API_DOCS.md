# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin@restaurant.com&password=admin123
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "staff"
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

## Menu Items

### Get All Menu Items
```http
GET /api/v1/menu?skip=0&limit=100&category=Pizza&available_only=true
```

### Create Menu Item (Admin Only)
```http
POST /api/v1/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "available": true
}
```

### Update Menu Item (Admin Only)
```http
PUT /api/v1/menu/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "price": 13.99,
  "available": true
}
```

### Delete Menu Item (Admin Only)
```http
DELETE /api/v1/menu/1
Authorization: Bearer <token>
```

### Upload Menu Item Image (Admin Only)
```http
POST /api/v1/menu/upload-image/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

## Orders

### Get All Orders
```http
GET /api/v1/orders?skip=0&limit=100&status_filter=pending&table_id=1
Authorization: Bearer <token>
```

### Create Order
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "table_id": 1,
  "items": [
    {
      "item_id": 1,
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "notes": "Extra cheese"
}
```

### Update Order
```http
PUT /api/v1/orders/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing",
  "payment_status": "paid"
}
```

### Get Order Statistics (Admin Only)
```http
GET /api/v1/orders/stats?days=7
Authorization: Bearer <token>
```

Response:
```json
{
  "total_orders": 150,
  "completed_orders": 140,
  "cancelled_orders": 10,
  "total_revenue": 3450.75,
  "average_order_value": 23.00
}
```

## Tables

### Get All Tables
```http
GET /api/v1/tables?status_filter=available
Authorization: Bearer <token>
```

### Create Table (Admin Only)
```http
POST /api/v1/tables
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": 1,
  "capacity": 4,
  "status": "available"
}
```

### Update Table
```http
PUT /api/v1/tables/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "occupied"
}
```

## Payments

### Create Payment
```http
POST /api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "amount": 25.98,
  "payment_method": "cash"
}
```

### Create Stripe Payment Intent
```http
POST /api/v1/payments/stripe/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2598,
  "currency": "usd",
  "order_id": 1
}
```

### Create PayPal Payment
```http
POST /api/v1/payments/paypal/create-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "amount": 25.98,
  "currency": "USD"
}
```

## WebSocket

### Connect to Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/client_123');

ws.onmessage = (event) => {
  console.log('Update:', event.data);
};
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Error Response Format

```json
{
  "detail": "Error message"
}
```

## Enums

### User Roles
- `admin` - Full access
- `staff` - Limited access

### Order Status
- `pending` - Order placed
- `preparing` - Being prepared
- `ready` - Ready for pickup/serving
- `completed` - Delivered/completed
- `cancelled` - Cancelled

### Payment Status
- `unpaid` - Not paid yet
- `paid` - Payment received
- `refunded` - Payment refunded

### Table Status
- `available` - Free to use
- `occupied` - Currently in use
- `reserved` - Reserved for customer

## Interactive Documentation

Visit these URLs for interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
