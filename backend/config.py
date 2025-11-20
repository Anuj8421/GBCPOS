import os
from dotenv import load_dotenv

load_dotenv()

# PHP Backend Configuration
PHP_BACKEND_BASE_URL = os.getenv('PHP_BACKEND_URL', 'https://gbcanteen-com.stackstaging.com')
PHP_API_KEY = os.getenv('PHP_API_KEY', 'your-api-key-here')  # Provide this to PHP developer

# API Endpoints
PHP_ORDER_STATUS_UPDATE = f"{PHP_BACKEND_BASE_URL}/api/order-status-update"
PHP_ORDER_DISPATCH = f"{PHP_BACKEND_BASE_URL}/api/order-dispatch"
PHP_ORDER_CANCEL = f"{PHP_BACKEND_BASE_URL}/api/order-cancel"
PHP_LOGIN = f"{PHP_BACKEND_BASE_URL}/api/auth/login"

# MongoDB Configuration
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
