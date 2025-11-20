# PHP Backend Integration Documentation

## Overview
The GBC POS app now has a complete backend integration layer that connects to your PHP backend at `https://gbcanteen-com.stackstaging.com`.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React POS App  │ ◄─────► │  FastAPI Backend │ ◄─────► │   PHP Backend   │
│   (Frontend)    │         │   (Middleware)   │         │  (Your System)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Endpoints Implemented

### 1. Order Reception (PHP → FastAPI)
**Endpoint:** `POST /api/orders/cloud-order-receive`

**Purpose:** Receive new orders from PHP backend

**Authentication:** Bearer token (API Key)

**Request Headers:**
```
Authorization: Bearer {PHP_API_KEY}
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "website_restaurant_id": "restaurant_123",
  "app_restaurant_uid": "uid_456",
  "userId": "user_789",
  "callback_url": "https://gbcanteen-com.stackstaging.com/callback",
  "idempotency_key": "unique-key-123",
  "orderNumber": "ORD12345",
  "amount": 45.99,
  "amountDisplay": "$45.99",
  "totals": {
    "subtotal": "$39.99",
    "discount": "$0.00",
    "delivery": "$3.00",
    "vat": "$3.00",
    "total": "$45.99"
  },
  "status": "pending",
  "channel": "web",
  "deliveryMethod": "delivery",
  "items": [
    {
      "title": "Burger Deluxe",
      "quantity": 2,
      "unitPrice": "$12.99",
      "unitPriceMinor": 1299,
      "price": 12.99,
      "lineTotal": "$25.98",
      "originalUnitPrice": "$12.99",
      "discountedUnitPrice": "$12.99",
      "discountPerUnit": "$0.00",
      "discountPerLine": "$0.00",
      "customizations": [
        {
          "group": "Toppings",
          "name": "Extra cheese",
          "price": 1.00
        }
      ],
      "notes": "No onions"
    }
  ],
  "user": {
    "name": "John Smith",
    "phone": "+1234567890",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "postcode": "10001"
    }
  },
  "restaurant": {
    "name": "Test Restaurant"
  },
  "orderNotes": "Please ring doorbell"
}
```

**Response:**
```json
{
  "message": "Order received successfully",
  "order_number": "ORD12345",
  "order_id": "mongodb_object_id"
}
```

### 2. Get New Orders (POS → FastAPI)
**Endpoint:** `GET /api/orders/new?restaurant_id={restaurant_id}`

**Purpose:** Poll for new orders (backup if push fails)

**Response:**
```json
{
  "orders": [...],
  "count": 5
}
```

### 3. Get Restaurant Orders (POS → FastAPI)
**Endpoint:** `GET /api/orders/restaurant/{restaurant_id}?status={status}`

**Purpose:** Get all orders for a restaurant, optionally filtered by status

### 4. Get Order by Number (POS → FastAPI)
**Endpoint:** `GET /api/orders/{order_number}`

**Purpose:** Get specific order details

### 5. Update Order Status (FastAPI → PHP)
**Endpoint:** `POST /api/orders/update-status`

**Purpose:** Update order status (accept/approve/ready)

**Request Body:**
```json
{
  "order_number": "ORD12345",
  "status": "approved",
  "timestamp": "2024-11-20T10:30:00Z",
  "updated_by": "kitchen_app",
  "notes": "Estimated 20 mins"
}
```

**This will be forwarded to PHP backend at:**
`POST https://gbcanteen-com.stackstaging.com/api/order-status-update`

### 6. Dispatch Order (FastAPI → PHP)
**Endpoint:** `POST /api/orders/dispatch`

**Purpose:** Mark order as dispatched (handed to rider)

**Request Body:**
```json
{
  "order_number": "ORD12345",
  "status": "dispatched",
  "timestamp": "2024-11-20T11:00:00Z",
  "dispatched_by": "kitchen_app",
  "notes": "Handed to rider"
}
```

**Forwarded to PHP:**
`POST https://gbcanteen-com.stackstaging.com/api/order-dispatch`

### 7. Cancel Order (FastAPI → PHP)
**Endpoint:** `POST /api/orders/cancel`

**Purpose:** Cancel an order

**Request Body:**
```json
{
  "order_number": "ORD12345",
  "status": "cancelled",
  "cancelled_at": "2024-11-20T10:15:00Z",
  "cancel_reason": "Item unavailable"
}
```

**Forwarded to PHP:**
`POST https://gbcanteen-com.stackstaging.com/api/order-cancel`

### 8. Login (POS → FastAPI → PHP)
**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate user

**Request Body:**
```json
{
  "email": "manager@restaurant.com",
  "password": "password123"
}
```

**Forwarded to PHP:**
`POST https://gbcanteen-com.stackstaging.com/api/auth/login`

**Expected Response from PHP:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Manager Name",
    "email": "manager@restaurant.com",
    "role": "manager"
  },
  "restaurant_id": "restaurant_123"
}
```

## Configuration

### Backend (.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="app_data"
CORS_ORIGINS=*
PHP_BACKEND_URL="https://gbcanteen-com.stackstaging.com"
PHP_API_KEY="gbc-pos-api-key-12345"
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://your-app.preview.emergentagent.com
REACT_APP_API_BASE=/api
```

## Authentication Flow

1. **POS App Login:**
   - User enters email/password
   - Frontend calls: `POST /api/auth/login`
   - FastAPI forwards to PHP backend
   - PHP returns token + restaurant_id
   - Frontend stores token in localStorage
   - All subsequent requests include: `Authorization: Bearer {token}`

2. **Order Reception:**
   - PHP backend pushes orders to: `POST /api/orders/cloud-order-receive`
   - Requires API key in header: `Authorization: Bearer {PHP_API_KEY}`

## Security

### API Key
The API key for PHP backend communication is stored in backend .env:
```
PHP_API_KEY="gbc-pos-api-key-12345"
```

**Share this key with your PHP developer** so they can:
1. Use it when pushing orders to our endpoint
2. Verify it when we send status updates back

### HTTPS
All communication happens over HTTPS.

### Idempotency
Orders use `idempotency_key` to prevent duplicates.

## Data Storage

### MongoDB Collections

**orders:**
- Stores all received orders
- Indexed by: `orderNumber`, `website_restaurant_id`, `idempotency_key`
- Includes internal status tracking

**sessions:**
- Tracks user login sessions
- Links users to restaurant_id

## For Your PHP Developer

### What You Need to Do:

1. **Store Our API Key:**
   ```
   API_KEY = "gbc-pos-api-key-12345"
   ```

2. **Push Orders to Us:**
   ```
   POST https://your-app.preview.emergentagent.com/api/orders/cloud-order-receive
   Headers:
     Authorization: Bearer gbc-pos-api-key-12345
     Content-Type: application/json
   Body: (see format above)
   ```

3. **Receive Status Updates:**
   Create these endpoints on your PHP backend:
   - `POST /api/order-status-update` - Receive accept/approve/ready updates
   - `POST /api/order-dispatch` - Receive dispatch notifications
   - `POST /api/order-cancel` - Receive cancellation requests

4. **Login Endpoint:**
   Implement:
   ```
   POST /api/auth/login
   Body: {"email": "...", "password": "..."}
   Response: {"token": "...", "user": {...}, "restaurant_id": "..."}
   ```

## Testing

### Test Order Reception:
```bash
curl -X POST https://your-app.preview.emergentagent.com/api/orders/cloud-order-receive \
  -H "Authorization: Bearer gbc-pos-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "website_restaurant_id": "restaurant_123",
    "orderNumber": "TEST001",
    "status": "pending",
    ...
  }'
```

### Test Status Update:
```bash
curl -X POST https://your-app.preview.emergentagent.com/api/orders/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "TEST001",
    "status": "approved",
    "timestamp": "2024-11-20T10:30:00Z"
  }'
```

### Health Check:
```bash
curl https://your-app.preview.emergentagent.com/api/health
```

## Error Handling

### Common Errors:

**401 Unauthorized:**
- Invalid or missing API key
- Check Authorization header

**404 Not Found:**
- Order not found
- Check order_number

**500 Internal Server Error:**
- Check backend logs: `/var/log/supervisor/backend.err.log`

**503 Service Unavailable:**
- PHP backend unreachable
- Check PHP_BACKEND_URL in .env

## Monitoring

### Check Backend Status:
```bash
sudo supervisorctl status backend
```

### View Backend Logs:
```bash
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

### Check Database:
```bash
mongosh
use app_data
db.orders.find().pretty()
```

## Next Steps

1. Share `PHP_API_KEY` with your PHP developer
2. PHP developer implements the required endpoints
3. Test order flow end-to-end
4. Configure real test credentials
5. Go live!

---

**Backend is LIVE and ready to receive orders!** ✅
