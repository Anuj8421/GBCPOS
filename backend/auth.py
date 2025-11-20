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
            # Bcrypt hash
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
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

async def authenticate_user(email: str, password: str) -> Optional[Dict]:
    """
    Authenticate user against MySQL database
    Returns user data if successful, None otherwise
    """
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                # Query users table - adjust table/column names as needed
                # Common table names: users, user, restaurant_users, etc.
                # Try multiple possible queries
                
                queries = [
                    # Try standard users table
                    "SELECT * FROM users WHERE email = %s AND status = 'active' LIMIT 1",
                    # Try without status check
                    "SELECT * FROM users WHERE email = %s LIMIT 1",
                    # Try user table (singular)
                    "SELECT * FROM user WHERE email = %s LIMIT 1",
                    # Try restaurant_users
                    "SELECT * FROM restaurant_users WHERE email = %s LIMIT 1",
                    # Try admins table
                    "SELECT * FROM admins WHERE email = %s LIMIT 1",
                ]
                
                user = None
                for query in queries:
                    try:
                        cursor.execute(query, (email,))
                        user = cursor.fetchone()
                        if user:
                            logger.info(f"User found with query: {query}")
                            break
                    except Exception as query_error:
                        logger.debug(f"Query failed: {query} - {str(query_error)}")
                        continue
                
                if not user:
                    logger.warning(f"User not found: {email}")
                    return None
                
                # Verify password - common password field names
                password_field = None
                for field in ['password', 'password_hash', 'hashed_password', 'pwd']:
                    if field in user:
                        password_field = field
                        break
                
                if not password_field:
                    logger.error(f"No password field found in user record. Fields: {user.keys()}")
                    return None
                
                stored_password = user[password_field]
                
                if not verify_password(password, stored_password):
                    logger.warning(f"Invalid password for user: {email}")
                    return None
                
                # Get restaurant_id - try multiple field names
                restaurant_id = None
                for field in ['restaurant_id', 'restaurantId', 'rest_id', 'store_id', 'id']:
                    if field in user and user[field]:
                        restaurant_id = str(user[field])
                        break
                
                # Return user data
                return {
                    'id': str(user.get('id', user.get('user_id', ''))),
                    'name': user.get('name', user.get('username', user.get('full_name', email.split('@')[0]))),
                    'email': email,
                    'role': user.get('role', user.get('user_role', 'manager')),
                    'restaurant_id': restaurant_id,
                    'phone': user.get('phone', user.get('mobile', '')),
                }
                
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return None
