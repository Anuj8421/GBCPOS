import pymysql
import os
from contextlib import contextmanager
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# MySQL Configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

@contextmanager
def get_mysql_connection():
    """Get MySQL database connection"""
    connection = None
    try:
        connection = pymysql.connect(**MYSQL_CONFIG)
        yield connection
    except Exception as e:
        logger.error(f"MySQL connection error: {str(e)}")
        raise
    finally:
        if connection:
            connection.close()

def test_connection():
    """Test MySQL connection"""
    try:
        with get_mysql_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                logger.info("MySQL connection successful!")
                return True
    except Exception as e:
        logger.error(f"MySQL connection failed: {str(e)}")
        return False
