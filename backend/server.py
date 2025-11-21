from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
from models import (
    CloudOrderReceive, OrderStatusUpdate, OrderDispatch, OrderCancel,
    LoginRequest, LoginResponse
)
from config import (
    PHP_BACKEND_BASE_URL, PHP_API_KEY, PHP_ORDER_STATUS_UPDATE,
    PHP_ORDER_DISPATCH, PHP_ORDER_CANCEL, PHP_LOGIN, MONGO_URL, DB_NAME, CORS_ORIGINS
)

ROOT_DIR = Path(__file__).parent

# MongoDB connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="GBC POS Backend API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication verification
async def verify_bearer_token(authorization: str = Header(None)):
    """Verify Bearer token from PHP backend"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split(" ")[1]
    
    # Validate token against PHP_API_KEY
    if token != PHP_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return token

# ==================== ORDER RECEPTION ENDPOINT ====================
@api_router.post("/orders/cloud-order-receive")
async def receive_cloud_order(
    order: CloudOrderReceive,
    token: str = Depends(verify_bearer_token)
):
    """
    Endpoint to receive new orders from PHP backend
    This endpoint is called by PHP backend when a new order is placed
    """
    try:
        logger.info(f"Received new order: {order.orderNumber} for restaurant {order.website_restaurant_id}")
        
        # Store order in MongoDB with idempotency check
        existing_order = await db.orders.find_one({"idempotency_key": order.idempotency_key})
        
        if existing_order:
            logger.warning(f"Duplicate order detected: {order.orderNumber}")
            return JSONResponse(
                status_code=200,
                content={"message": "Order already processed", "order_number": order.orderNumber}
            )
        
        # Prepare order document
        order_doc = order.model_dump()
        order_doc['received_at'] = datetime.now(timezone.utc).isoformat()
        order_doc['internal_status'] = 'new'  # Track internal status
        
        # Insert into MongoDB
        result = await db.orders.insert_one(order_doc)
        
        logger.info(f"Order stored successfully: {order.orderNumber}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Order received successfully",
                "order_number": order.orderNumber,
                "order_id": str(result.inserted_id)
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing order: {str(e)}")

# ==================== GET ORDERS FOR POS APP ====================
@api_router.get("/orders/new")
async def get_new_orders(restaurant_id: str):
    """
    Polling endpoint for POS app to fetch new orders
    Used as backup if real-time push fails
    """
    try:
        # Query orders for specific restaurant that haven't been fetched yet
        orders = await db.orders.find({
            "website_restaurant_id": restaurant_id,
            "internal_status": "new"
        }).to_list(100)
        
        # Convert ObjectId to string and format for response
        for order in orders:
            order['_id'] = str(order['_id'])
        
        return JSONResponse(
            status_code=200,
            content={"orders": orders, "count": len(orders)}
        )
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@api_router.get("/orders/restaurant/{restaurant_id}")
async def get_orders_by_restaurant(restaurant_id: str, status: Optional[str] = None):
    """
    Get all orders for a specific restaurant, optionally filtered by status
    """
    try:
        query = {"website_restaurant_id": restaurant_id}
        if status:
            query['status'] = status
        
        orders = await db.orders.find(query).sort("received_at", -1).to_list(1000)
        
        # Convert ObjectId to string
        for order in orders:
            order['_id'] = str(order['_id'])
        
        return JSONResponse(
            status_code=200,
            content={"orders": orders, "count": len(orders)}
        )
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ORDER FETCHING FROM MYSQL ====================
@api_router.get("/orders/list")
async def get_restaurant_orders_list(restaurant_id: int, status: Optional[str] = None, limit: int = 100):
    """
    Get orders for a restaurant from MySQL database
    Supports filtering by status
    """
    try:
        from services.order_service import get_orders
        orders = get_orders(restaurant_id, status, limit)
        return JSONResponse(status_code=200, content={"orders": orders, "count": len(orders)})
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/orders/detail/{order_number}")
async def get_order_detail_mysql(order_number: str, restaurant_id: int):
    """
    Get detailed information for a specific order from MySQL
    """
    try:
        from services.order_service import get_order_by_number
        order = get_order_by_number(restaurant_id, order_number)
        if order:
            return JSONResponse(status_code=200, content=order)
        else:
            raise HTTPException(status_code=404, detail="Order not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/orders/{order_number}")
async def get_order_by_number(order_number: str):
    """
    Get a specific order by order number (MongoDB - legacy)
    """
    try:
        order = await db.orders.find_one({"orderNumber": order_number})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order['_id'] = str(order['_id'])
        return JSONResponse(status_code=200, content=order)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ORDER STATUS UPDATE TO PHP BACKEND ====================
@api_router.post("/orders/update-status")
async def update_order_status(update: OrderStatusUpdate):
    """
    Update order status and send to PHP backend
    Called by POS app when accepting/approving/marking ready
    """
    try:
        logger.info(f"Updating order {update.order_number} to status {update.status}")
        
        # Update in local database
        await db.orders.update_one(
            {"orderNumber": update.order_number},
            {"$set": {
                "status": update.status,
                "updated_at": update.timestamp,
                "internal_status": update.status
            }}
        )
        
        # Send to PHP backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PHP_ORDER_STATUS_UPDATE,
                json=update.model_dump(),
                headers={
                    "Authorization": f"Bearer {PHP_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"PHP backend returned error: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"PHP backend error: {response.text}"
                )
        
        return JSONResponse(
            status_code=200,
            content={"message": "Order status updated successfully"}
        )
        
    except httpx.RequestError as e:
        logger.error(f"Network error updating order: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Network error: {str(e)}")
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/orders/dispatch")
async def dispatch_order(dispatch: OrderDispatch):
    """
    Mark order as dispatched and send to PHP backend
    Called by POS app when handing over to rider
    """
    try:
        logger.info(f"Dispatching order {dispatch.order_number}")
        
        # Update in local database
        await db.orders.update_one(
            {"orderNumber": dispatch.order_number},
            {"$set": {
                "status": "dispatched",
                "dispatched_at": dispatch.timestamp,
                "internal_status": "dispatched"
            }}
        )
        
        # Send to PHP backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PHP_ORDER_DISPATCH,
                json=dispatch.model_dump(),
                headers={
                    "Authorization": f"Bearer {PHP_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"PHP backend returned error: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"PHP backend error: {response.text}"
                )
        
        return JSONResponse(
            status_code=200,
            content={"message": "Order dispatched successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error dispatching order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/orders/cancel")
async def cancel_order(cancel: OrderCancel):
    """
    Cancel order and send to PHP backend
    Called by POS app when declining/cancelling an order
    """
    try:
        logger.info(f"Cancelling order {cancel.order_number}")
        
        # Update in local database
        await db.orders.update_one(
            {"orderNumber": cancel.order_number},
            {"$set": {
                "status": "cancelled",
                "cancelled_at": cancel.cancelled_at,
                "cancel_reason": cancel.cancel_reason,
                "internal_status": "cancelled"
            }}
        )
        
        # Send to PHP backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PHP_ORDER_CANCEL,
                json=cancel.model_dump(),
                headers={
                    "Authorization": f"Bearer {PHP_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"PHP backend returned error: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"PHP backend error: {response.text}"
                )
        
        return JSONResponse(
            status_code=200,
            content={"message": "Order cancelled successfully"}
        )
        
    except Exception as e:
        logger.error(f"Error cancelling order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AUTHENTICATION ====================
@api_router.post("/auth/login")
async def login(credentials: LoginRequest):
    """
    Authenticate restaurant user against MySQL database
    Returns JWT token and restaurant data
    """
    try:
        logger.info(f"Login attempt for: {credentials.email}")
        
        # Import auth module
        from auth import authenticate_user, create_access_token
        
        # Authenticate against MySQL database (supports both username and email)
        restaurant_data = await authenticate_user(credentials.email, credentials.password)
        
        if not restaurant_data:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials or restaurant not active"
            )
        
        # Create JWT token with restaurant information
        token_data = {
            "sub": restaurant_data.get('email') or restaurant_data.get('username'),
            "user_id": restaurant_data['id'],
            "restaurant_id": restaurant_data['restaurant_id'],
            "app_restaurant_uid": restaurant_data.get('app_restaurant_uid')
        }
        token = create_access_token(token_data)
        
        # Store session in MongoDB for tracking
        await db.sessions.insert_one({
            "username": restaurant_data.get('username'),
            "email": restaurant_data.get('email'),
            "restaurant_id": restaurant_data['restaurant_id'],
            "logged_in_at": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(f"Login successful for restaurant: {restaurant_data.get('name')}")
        
        return JSONResponse(
            status_code=200,
            content={
                "token": token,
                "user": restaurant_data,
                "restaurant": restaurant_data,
                "restaurant_id": restaurant_data['restaurant_id']
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed. Please contact support.")

@api_router.post("/auth/google")
async def google_login(google_data: dict):
    """
    Google OAuth login - proxy to PHP backend
    """
    try:
        logger.info(f"Google login attempt")
        
        # Forward to PHP backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{PHP_BACKEND_BASE_URL}/api/auth/google",
                json=google_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Google authentication failed"
                )
            
            php_response = response.json()
            
            # Store session
            await db.sessions.insert_one({
                "email": google_data.get('email'),
                "auth_method": "google",
                "restaurant_id": php_response.get('restaurant_id'),
                "logged_in_at": datetime.now(timezone.utc).isoformat()
            })
            
            return JSONResponse(status_code=200, content=php_response)
    
    except httpx.RequestError as e:
        logger.error(f"Network error during Google login: {str(e)}")
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    except HTTPException:
        raise

# ==================== MENU MANAGEMENT ====================
@api_router.get("/menu/items")
async def get_menu_items(restaurant_id: int, category: Optional[str] = None, search: Optional[str] = None):
    """
    Get menu items for a restaurant
    Supports filtering by category and search
    """
    try:
        from services.menu_service import get_menu_items
        items = get_menu_items(restaurant_id, category, search)
        return JSONResponse(status_code=200, content={"items": items, "count": len(items)})
    except Exception as e:
        logger.error(f"Error fetching menu items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/menu/categories")
async def get_menu_categories(restaurant_id: int):
    """
    Get menu categories for a restaurant
    """
    try:
        from services.menu_service import get_menu_categories
        categories = get_menu_categories(restaurant_id)
        return JSONResponse(status_code=200, content={"categories": categories})
    except Exception as e:
        logger.error(f"Error fetching menu categories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/menu/items/{dish_id}/availability")
async def update_dish_availability(dish_id: int, restaurant_id: int, available: bool):
    """
    Update availability status for a dish
    """
    try:
        from services.menu_service import update_dish_availability
        success = update_dish_availability(dish_id, restaurant_id, available)
        if success:
            return JSONResponse(status_code=200, content={"message": "Availability updated"})
        else:
            raise HTTPException(status_code=500, detail="Failed to update availability")
    except Exception as e:
        logger.error(f"Error updating dish availability: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/menu/bulk-availability")
async def bulk_update_availability(data: dict):
    """
    Bulk update availability for multiple dishes
    Expected: {"restaurant_id": 123, "dish_ids": [1,2,3], "available": true}
    """
    try:
        from services.menu_service import bulk_update_availability
        restaurant_id = data.get('restaurant_id')
        dish_ids = data.get('dish_ids', [])
        available = data.get('available', True)
        
        success = bulk_update_availability(restaurant_id, dish_ids, available)
        if success:
            return JSONResponse(status_code=200, content={"message": f"Updated {len(dish_ids)} items"})
        else:
            raise HTTPException(status_code=500, detail="Failed to bulk update")
    except Exception as e:
        logger.error(f"Error bulk updating availability: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/orders/{order_number}/status")
async def update_order_status_api(order_number: str, data: dict):
    """
    Update order status
    Expected: {"restaurant_id": 123, "status": "approved", "updated_by": "user"}
    """
    try:
        from services.order_service import update_order_status
        restaurant_id = data.get('restaurant_id')
        new_status = data.get('status')
        updated_by = data.get('updated_by', 'system')
        
        success = update_order_status(restaurant_id, order_number, new_status, updated_by)
        if success:
            return JSONResponse(status_code=200, content={"message": "Order status updated"})
        else:
            raise HTTPException(status_code=500, detail="Failed to update order status")
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DASHBOARD STATISTICS ====================
@api_router.get("/dashboard/stats")
async def get_dashboard_statistics(restaurant_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get dashboard statistics for a restaurant
    Optionally filter by date range
    """
    try:
        from services.order_service import get_dashboard_stats
        stats = get_dashboard_stats(restaurant_id, start_date, end_date)
        return JSONResponse(status_code=200, content=stats)
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/dashboard/top-dishes")
async def get_top_dishes_api(restaurant_id: int, limit: int = 5, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get top selling dishes for dashboard
    """
    try:
        from services.order_service import get_top_dishes
        dishes = get_top_dishes(restaurant_id, limit, start_date, end_date)
        return JSONResponse(status_code=200, content={"dishes": dishes})
    except Exception as e:
        logger.error(f"Error fetching top dishes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/dashboard/frequent-customers")
async def get_frequent_customers_api(restaurant_id: int, limit: int = 5, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Get most frequent customers for dashboard
    """
    try:
        from services.order_service import get_frequent_customers
        customers = get_frequent_customers(restaurant_id, limit, start_date, end_date)
        return JSONResponse(status_code=200, content={"customers": customers})
    except Exception as e:
        logger.error(f"Error fetching frequent customers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


    except Exception as e:
        logger.error(f"Error during Google login: {str(e)}")
        raise HTTPException(status_code=500, detail="Google login failed")

# ==================== HEALTH CHECK ====================
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "php_backend": PHP_BACKEND_BASE_URL
    }

@api_router.get("/")
async def root():
    return {
        "message": "GBC POS Backend API",
        "version": "1.0.0",
        "endpoints": {
            "receive_orders": "/api/orders/cloud-order-receive",
            "get_new_orders": "/api/orders/new?restaurant_id={id}",
            "get_restaurant_orders": "/api/orders/restaurant/{id}",
            "update_status": "/api/orders/update-status",
            "dispatch": "/api/orders/dispatch",
            "cancel": "/api/orders/cancel",
            "login": "/api/auth/login"
        }
    }

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
