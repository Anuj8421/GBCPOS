import jwt
import bcrypt
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from dotenv import load_dotenv
import logging
from db_mysql import get_mysql_connection

load_dotenv()

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        # Handle different hash formats (bcrypt, md5, etc.)
        if hashed_password.startswith('$2'):
            # Bcrypt hash - PHP uses $2y$ but Python bcrypt uses $2b$
            # They are compatible, just need to convert
            hash_to_check = hashed_password
            if hashed_password.startswith('$2y$'):
                # Convert PHP's $2y$ to Python's $2b$ (they're compatible)
                hash_to_check = '$2b$' + hashed_password[4:]
            
            return bcrypt.checkpw(plain_password.encode('utf-8'), hash_to_check.encode('utf-8'))
        else:
            # Plain text comparison (not recommended but some legacy systems use it)
            # Or MD5/SHA comparison
            import hashlib
            md5_hash = hashlib.md5(plain_password.encode()).hexdigest()
            sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
            return hashed_password == plain_password or hashed_password == md5_hash or hashed_password == sha256_hash
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict]:
    """Decode JWT access token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        return None

async def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """
    Authenticate restaurant user against MySQL database
    Returns restaurant data if successful, None otherwise
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Query restaurants table by username or email
                logger.info(f"Attempting authentication for: {username}")
                
                # Try both username and email fields
                cursor.execute("""
                    SELECT * FROM restaurants 
                    WHERE (username = %s OR email = %s) 
                    AND is_active = 1 
                    AND status = 'approved'
                    LIMIT 1
                """, (username, username))
                
                restaurant = cursor.fetchone()
                
                if not restaurant:
                    logger.warning(f"Restaurant not found or not active: {username}")
                    return None
                
                # Verify password
                stored_password = restaurant.get('password_hash')
                
                if not stored_password:
                    logger.error(f"No password_hash found for restaurant: {username}")
                    return None
                
                if not verify_password(password, stored_password):
                    logger.warning(f"Invalid password for restaurant: {username}")
                    return None
                
                # Return restaurant data
                return {
                    'id': str(restaurant['id']),
                    'restaurant_id': str(restaurant['id']),
                    'app_restaurant_uid': restaurant.get('app_restaurant_uid', ''),
                    'name': restaurant.get('name', ''),
                    'username': restaurant.get('username', ''),
                    'email': restaurant.get('email', ''),
                    'manager_name': restaurant.get('manager_name', ''),
                    'manager_email': restaurant.get('manager_email', ''),
                    'contact_number': restaurant.get('contact_number', ''),
                    'address': restaurant.get('address', ''),
                    'city': restaurant.get('city', ''),
                    'postcode': restaurant.get('postcode', ''),
                    'opening_time': str(restaurant.get('opening_time', '')) if restaurant.get('opening_time') else '',
                    'closing_time': str(restaurant.get('closing_time', '')) if restaurant.get('closing_time') else '',
                    'status': restaurant.get('status', ''),
                    'is_active': restaurant.get('is_active', 0),
                }
                
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return None
