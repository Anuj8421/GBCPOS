from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Order Reception Models (from PHP Backend)
class Customization(BaseModel):
    group: str
    name: str
    price: float

class OrderItem(BaseModel):
    title: str
    quantity: int
    unitPrice: str
    unitPriceMinor: int
    price: float
    lineTotal: str
    originalUnitPrice: str
    discountedUnitPrice: str
    discountPerUnit: str
    discountPerLine: str
    customizations: List[Customization] = []
    notes: Optional[str] = ""

class Address(BaseModel):
    line1: str
    line2: Optional[str] = ""
    city: str
    state: Optional[str] = ""
    country: str
    postcode: str

class User(BaseModel):
    name: str
    phone: str
    email: str
    address: Address

class Restaurant(BaseModel):
    name: str

class Totals(BaseModel):
    subtotal: str
    discount: str
    delivery: str
    vat: str
    total: str

class CloudOrderReceive(BaseModel):
    website_restaurant_id: str
    app_restaurant_uid: str
    userId: str
    callback_url: Optional[str] = ""
    idempotency_key: str
    orderNumber: str
    amount: float
    amountDisplay: str
    totals: Totals
    status: str
    channel: str
    deliveryMethod: Optional[str] = ""
    items: List[OrderItem]
    user: User
    restaurant: Restaurant
    orderNotes: Optional[str] = ""

# Order Status Update Models (to PHP Backend)
class OrderStatusUpdate(BaseModel):
    order_number: str
    status: str  # "approved", "ready"
    timestamp: str  # ISO 8601
    updated_by: str = "kitchen_app"
    notes: Optional[str] = ""

class OrderDispatch(BaseModel):
    order_number: str
    status: str = "dispatched"
    timestamp: str  # ISO 8601
    dispatched_by: str = "kitchen_app"
    notes: Optional[str] = ""

class OrderCancel(BaseModel):
    order_number: str
    status: str = "cancelled"
    cancelled_at: str  # ISO 8601
    cancel_reason: str

# Authentication Models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]
    restaurant_id: str
