# GBC POS - Restaurant Partner App

## Overview
Comprehensive Point-of-Sale system for restaurants, optimized for iMin Swift 2 Pro devices (6.5" screen, 720×1600 resolution).

## Current Status
✅ **Phase 1 Complete** - Foundation, Authentication, and Core UI

### Completed Features

#### 1. **Authentication System**
- ✅ JWT-based login/register
- ✅ Google OAuth integration (ready for Emergent OAuth)
- ✅ Protected routes
- ✅ Token management
- ✅ Session persistence

#### 2. **Dashboard**
- ✅ Today's summary cards (sales, orders, prep time, ratings)
- ✅ Recent orders list
- ✅ Quick actions
- ✅ Real-time statistics display

#### 3. **Order Management**
- ✅ Order listing with multiple status tabs (All, Pending, Accepted, Ready, Delivered, Cancelled, Refunded, Scheduled)
- ✅ Order detail view
- ✅ Accept/Decline orders
- ✅ Set preparation time
- ✅ Mark orders as ready
- ✅ Customer information display
- ✅ Order items with modifiers and notes

#### 4. **Printer Integration (iMin Swift 2 Pro)**
- ✅ Kitchen receipt printing
- ✅ Delivery bag sticker printing
- ✅ Customer receipt printing
- ✅ Test print functionality
- ✅ Mock mode for development (automatically detects iMin device)

#### 5. **UI/UX**
- ✅ Responsive layout optimized for 6.5" screen
- ✅ Sidebar navigation
- ✅ Header with store status toggle
- ✅ Modern design with Tailwind CSS
- ✅ Radix UI components
- ✅ Toast notifications
- ✅ Data-testid attributes for testing

#### 6. **Service Layer**
- ✅ API client with interceptors
- ✅ Authentication service
- ✅ Order service
- ✅ Menu service
- ✅ Store service
- ✅ Analytics service
- ✅ Finance service
- ✅ Printer service
- ✅ Ready for PHP backend integration

### Pending PHP Backend Integration

The app is **fully functional with mock data** and ready to connect to your PHP backend. Once you provide the API endpoints, we need to:

1. Update `REACT_APP_PHP_API_URL` in `/app/frontend/.env`
2. Map PHP endpoints to service methods
3. Test authentication flow
4. Verify data models match
5. Handle error responses

### Pages Structure

#### ✅ Implemented
- `/auth` - Login & Register
- `/dashboard` - Today's Summary
- `/orders` - Order Management
- `/orders/:orderId` - Order Detail

#### 🔄 Placeholder (Ready for PHP backend)
- `/menu` - Menu Management
- `/store` - Store Settings
- `/analytics` - Analytics & Performance
- `/finance` - Finance & Payouts
- `/users` - User Management
- `/settings` - App Settings

## Technical Stack

### Frontend
- **React 19** - UI framework
- **React Router v7** - Navigation
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **Sonner** - Toast notifications
- **jsPDF** - PDF generation
- **react-to-print** - Print functionality

### Backend (Current)
- **FastAPI** - Python backend (placeholder)
- **MongoDB** - Database
- **Motor** - Async MongoDB driver

### Device Integration
- **iMin Swift 2 Pro**
  - Screen: 6.5" (720×1600)
  - Built-in printer (58mm, 100mm/s)
  - Android 13
  - NFC support
  - Barcode scanner

## Project Structure

```
/app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Auth components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # Radix UI components
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── AppContext.js
│   │   ├── pages/              # Page components
│   │   │   ├── AuthPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── OrdersPage.js
│   │   │   ├── OrderDetailPage.js
│   │   │   ├── MenuPage.js
│   │   │   ├── StorePage.js
│   │   │   ├── AnalyticsPage.js
│   │   │   ├── FinancePage.js
│   │   │   ├── UsersPage.js
│   │   │   └── SettingsPage.js
│   │   ├── services/           # API services
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── order.service.js
│   │   │   ├── menu.service.js
│   │   │   ├── store.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── finance.service.js
│   │   │   └── printer.service.js
│   │   ├── utils/              # Utilities
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   └── App.js              # Main app
│   ├── .env                    # Environment variables
│   └── package.json
└── backend/
    ├── server.py               # FastAPI server
    ├── requirements.txt
    └── .env
```

## Environment Variables

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://restaurant-pos-12.preview.emergentagent.com
REACT_APP_PHP_API_URL=http://your-php-backend.com/api  # Add this
WDS_SOCKET_PORT=443
```

### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=gbc_pos_db
CORS_ORIGINS=*
```

## PHP Backend Integration Checklist

### Required API Endpoints

#### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

#### Orders
- `GET /orders?status={status}` - Get orders (with optional status filter)
- `GET /orders/{orderId}` - Get order details
- `POST /orders/{orderId}/accept` - Accept order
- `POST /orders/{orderId}/cancel` - Cancel order
- `POST /orders/{orderId}/ready` - Mark order as ready
- `PATCH /orders/{orderId}/status` - Update order status
- `POST /orders/{orderId}/prep-time` - Set preparation time

#### Menu
- `GET /menu/categories` - Get all categories
- `GET /menu/items?categoryId={id}` - Get menu items
- `GET /menu/items/{itemId}` - Get menu item
- `POST /menu/items` - Create menu item
- `PUT /menu/items/{itemId}` - Update menu item
- `DELETE /menu/items/{itemId}` - Delete menu item
- `PATCH /menu/items/{itemId}/availability` - Toggle availability
- `POST /menu/bulk-upload` - Bulk upload via CSV

#### Store
- `GET /store/info` - Get store information
- `PUT /store/info` - Update store information
- `GET /store/status` - Get store status
- `POST /store/status` - Toggle store status
- `GET /store/hours` - Get store hours
- `PUT /store/hours` - Update store hours
- `GET /store/prep-time` - Get prep time settings
- `PUT /store/prep-time` - Update prep time settings

#### Analytics
- `GET /analytics/dashboard?date={date}` - Dashboard summary
- `GET /analytics/sales?period={period}` - Sales analytics
- `GET /analytics/operations?period={period}` - Operations metrics
- `GET /analytics/reviews?page={page}&limit={limit}` - Customer reviews
- `POST /analytics/reviews/{reviewId}/reply` - Reply to review

#### Finance
- `GET /finance/payouts` - Get payouts overview
- `GET /finance/payouts/orders?startDate={date}&endDate={date}` - Payouts by order
- `GET /finance/invoices?page={page}&limit={limit}` - Get invoices
- `GET /finance/invoices/{invoiceId}/download` - Download invoice
- `GET /finance/banking` - Get banking details
- `PUT /finance/banking` - Update banking details

### Authentication Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Sample Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Running the App

### Development
```bash
# Frontend (already running via supervisor)
cd /app/frontend
yarn start

# Check status
sudo supervisorctl status frontend

# View logs
tail -f /var/log/supervisor/frontend.out.log
```

### Testing
The app includes `data-testid` attributes on all interactive elements for automated testing.

## Printer Integration

### iMin SDK Integration
The app includes a printer service that automatically detects if running on an iMin device:

```javascript
// Check if printer is available
printerService.isPrinterAvailable()

// Print kitchen receipt
await printerService.printKitchenReceipt(order)

// Print delivery sticker
await printerService.printDeliverySticker(order)

// Print customer receipt
await printerService.printCustomerReceipt(order)

// Test print
await printerService.testPrint()
```

### Mock Mode
When not running on an iMin device, the printer service operates in mock mode and logs print actions to the console.

## Next Steps

### Immediate (Waiting for PHP Backend Details)
1. ✅ Provide PHP backend base URL and API endpoints
2. ✅ Share authentication mechanism (JWT format, token expiry, etc.)
3. ✅ Provide sample API responses for data model validation
4. Connect services to PHP endpoints
5. Test authentication flow
6. Test order management flow

### Phase 2 (After PHP Integration)
1. Complete Menu Management UI
2. Complete Store Settings UI
3. Complete Analytics Dashboard
4. Complete Finance Module
5. Complete User Management

### Phase 3 (Advanced Features)
1. Real-time order notifications
2. Advanced analytics charts
3. Bulk operations
4. Export functionality
5. Multi-language support

## Device Optimization

### Screen Specifications
- **Resolution**: 720×1600 pixels
- **Screen Size**: 6.5 inches (portrait)
- **Touch Targets**: Minimum 44px for easy tapping
- **Font Sizes**: Optimized for readability on handheld device

### Performance
- Lazy loading for images
- Optimized bundle size
- Fast navigation with React Router
- Efficient state management

## Notes

1. **Mock Data**: Currently using mock data for demonstration. All service methods are ready to connect to PHP backend.

2. **Printer Integration**: The iMin printer SDK will work when deployed on the actual device. Currently operates in mock mode for development.

3. **Authentication**: Both JWT and Google OAuth flows are implemented. Google OAuth uses a placeholder that will be replaced with actual Emergent OAuth integration.

4. **Hot Reload**: Frontend has hot reload enabled. Changes to code will automatically refresh the browser.

5. **Error Handling**: Comprehensive error handling is in place with user-friendly toast notifications.

## Contact & Support

For PHP backend integration, please provide:
- Base URL
- API endpoint documentation
- Sample responses
- Authentication details
- Any special headers or configurations required

---

**Built with ❤️ for GBC Restaurant Partners**
