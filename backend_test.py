#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for GBC POS Application
Tests all API endpoints with proper authentication and error handling
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

class GBCPOSAPITester:
    def __init__(self):
        self.base_url = "https://restaurant-pos-12.preview.emergentagent.com/api"
        self.token = None
        self.restaurant_id = None
        self.test_results = []
        
        # Test credentials
        self.username = "thecurryvault"
        self.password = "Password@123"
        self.expected_restaurant_id = "196"
        
    def log_test(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
            
        if self.token and "Authorization" not in default_headers:
            default_headers["Authorization"] = f"Bearer {self.token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PATCH":
                response = requests.patch(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
            
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.make_request("GET", "/health")
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "ok":
                    self.log_test("Health Check", True, "Health endpoint working correctly", data)
                else:
                    self.log_test("Health Check", False, f"Unexpected health response: {data}")
            else:
                self.log_test("Health Check", False, f"Health check failed with status {response.status_code}")
        except Exception as e:
            self.log_test("Health Check", False, f"Health check error: {str(e)}")
            
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        try:
            login_data = {
                "username": self.username,
                "password": self.password
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "restaurant" in data:
                    self.token = data["token"]
                    self.restaurant_id = str(data["restaurant"]["id"])
                    
                    # Verify restaurant ID matches expected
                    if self.restaurant_id == self.expected_restaurant_id:
                        self.log_test("Login Valid Credentials", True, 
                                    f"Login successful, restaurant ID: {self.restaurant_id}", data)
                    else:
                        self.log_test("Login Valid Credentials", False, 
                                    f"Restaurant ID mismatch. Expected: {self.expected_restaurant_id}, Got: {self.restaurant_id}")
                else:
                    self.log_test("Login Valid Credentials", False, 
                                f"Login response missing required fields: {data}")
            else:
                self.log_test("Login Valid Credentials", False, 
                            f"Login failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Login Valid Credentials", False, f"Login error: {str(e)}")
            
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "username": "wronguser",
                "password": "wrongpassword"
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response.status_code == 401:
                self.log_test("Login Invalid Credentials", True, 
                            "Correctly rejected invalid credentials")
            else:
                self.log_test("Login Invalid Credentials", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Login Invalid Credentials", False, f"Invalid login test error: {str(e)}")
            
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        try:
            login_data = {"username": self.username}  # Missing password
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response.status_code == 400:
                self.log_test("Login Missing Fields", True, 
                            "Correctly rejected login with missing fields")
            else:
                self.log_test("Login Missing Fields", False, 
                            f"Expected 400, got {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Login Missing Fields", False, f"Missing fields test error: {str(e)}")
            
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token"""
        try:
            # Temporarily remove token
            original_token = self.token
            self.token = None
            
            response = self.make_request("GET", "/dashboard/stats")
            
            if response.status_code == 401:
                self.log_test("Protected Endpoint No Token", True, 
                            "Correctly rejected request without token")
            else:
                self.log_test("Protected Endpoint No Token", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
                            
            # Restore token
            self.token = original_token
        except Exception as e:
            self.log_test("Protected Endpoint No Token", False, f"No token test error: {str(e)}")
            
    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        if not self.token:
            self.log_test("Dashboard Stats", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/dashboard/stats")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Dashboard Stats", True, 
                            "Dashboard stats retrieved successfully", data)
            else:
                self.log_test("Dashboard Stats", False, 
                            f"Dashboard stats failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Dashboard stats error: {str(e)}")
            
    def test_dashboard_top_dishes(self):
        """Test dashboard top dishes endpoint"""
        if not self.token:
            self.log_test("Dashboard Top Dishes", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/dashboard/top-dishes")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Dashboard Top Dishes", True, 
                            "Top dishes retrieved successfully", data)
            else:
                self.log_test("Dashboard Top Dishes", False, 
                            f"Top dishes failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard Top Dishes", False, f"Top dishes error: {str(e)}")
            
    def test_dashboard_frequent_customers(self):
        """Test dashboard frequent customers endpoint"""
        if not self.token:
            self.log_test("Dashboard Frequent Customers", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/dashboard/frequent-customers")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Dashboard Frequent Customers", True, 
                            "Frequent customers retrieved successfully", data)
            else:
                self.log_test("Dashboard Frequent Customers", False, 
                            f"Frequent customers failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Dashboard Frequent Customers", False, f"Frequent customers error: {str(e)}")
            
    def test_orders_list_all(self):
        """Test orders list with status=all"""
        if not self.token:
            self.log_test("Orders List All", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/orders/list?status=all")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Orders List All", True, 
                            f"Orders list retrieved successfully, count: {len(data) if isinstance(data, list) else 'N/A'}", 
                            data)
            else:
                self.log_test("Orders List All", False, 
                            f"Orders list failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Orders List All", False, f"Orders list error: {str(e)}")
            
    def test_orders_list_pending(self):
        """Test orders list with status=pending"""
        if not self.token:
            self.log_test("Orders List Pending", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/orders/list?status=pending")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Orders List Pending", True, 
                            f"Pending orders retrieved successfully, count: {len(data) if isinstance(data, list) else 'N/A'}", 
                            data)
            else:
                self.log_test("Orders List Pending", False, 
                            f"Pending orders failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Orders List Pending", False, f"Pending orders error: {str(e)}")
            
    def test_orders_list_dispatched(self):
        """Test orders list with status=dispatched"""
        if not self.token:
            self.log_test("Orders List Dispatched", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/orders/list?status=dispatched")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Orders List Dispatched", True, 
                            f"Dispatched orders retrieved successfully, count: {len(data) if isinstance(data, list) else 'N/A'}", 
                            data)
            else:
                self.log_test("Orders List Dispatched", False, 
                            f"Dispatched orders failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Orders List Dispatched", False, f"Dispatched orders error: {str(e)}")
            
    def test_order_detail(self):
        """Test order detail endpoint with a real order number"""
        if not self.token:
            self.log_test("Order Detail", False, "No authentication token available")
            return
            
        try:
            # First get orders list to find a real order number
            response = self.make_request("GET", "/orders/list?status=all")
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list) and len(orders) > 0:
                    # Use the first order's number
                    order_number = orders[0].get('order_number') or orders[0].get('orderNumber')
                    if order_number:
                        # URL encode the order number (especially for # character)
                        import urllib.parse
                        encoded_order_number = urllib.parse.quote(order_number, safe='')
                        detail_response = self.make_request("GET", f"/orders/detail/{encoded_order_number}")
                        
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            self.log_test("Order Detail", True, 
                                        f"Order detail retrieved for order {order_number}", detail_data)
                        else:
                            self.log_test("Order Detail", False, 
                                        f"Order detail failed with status {detail_response.status_code}: {detail_response.text}")
                    else:
                        self.log_test("Order Detail", False, "No order number found in orders list")
                else:
                    self.log_test("Order Detail", False, "No orders available to test detail endpoint")
            else:
                self.log_test("Order Detail", False, "Could not retrieve orders list for detail test")
        except Exception as e:
            self.log_test("Order Detail", False, f"Order detail error: {str(e)}")
            
    def test_order_detail_nonexistent(self):
        """Test order detail with non-existent order number"""
        if not self.token:
            self.log_test("Order Detail Nonexistent", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/orders/detail/NONEXISTENT123")
            
            if response.status_code == 404:
                self.log_test("Order Detail Nonexistent", True, 
                            "Correctly returned 404 for non-existent order")
            else:
                self.log_test("Order Detail Nonexistent", False, 
                            f"Expected 404, got {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Order Detail Nonexistent", False, f"Nonexistent order test error: {str(e)}")
            
    def test_menu_items(self):
        """Test menu items endpoint"""
        if not self.token:
            self.log_test("Menu Items", False, "No authentication token available")
            return
            
        try:
            response = self.make_request("GET", "/menu/items")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Menu Items", True, 
                            f"Menu items retrieved successfully, count: {len(data) if isinstance(data, list) else 'N/A'}", 
                            data)
            else:
                self.log_test("Menu Items", False, 
                            f"Menu items failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Menu Items", False, f"Menu items error: {str(e)}")
            
    def test_add_menu_item(self):
        """Test adding a new menu item"""
        if not self.token:
            self.log_test("Add Menu Item", False, "No authentication token available")
            return
            
        try:
            new_item = {
                "name": "Test Curry Dish",
                "description": "A delicious test curry for API testing",
                "price": 12.99,
                "category": "Main Course",
                "is_available": True
            }
            
            response = self.make_request("POST", "/menu/item", new_item)
            
            if response.status_code == 201:
                data = response.json()
                self.log_test("Add Menu Item", True, 
                            "Menu item added successfully", data)
                return data.get('id')  # Return item ID for potential cleanup
            else:
                self.log_test("Add Menu Item", False, 
                            f"Add menu item failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Add Menu Item", False, f"Add menu item error: {str(e)}")
            
    def test_update_menu_item(self):
        """Test updating a menu item"""
        if not self.token:
            self.log_test("Update Menu Item", False, "No authentication token available")
            return
            
        try:
            # First get menu items to find one to update
            response = self.make_request("GET", "/menu/items")
            
            if response.status_code == 200:
                items = response.json()
                if isinstance(items, list) and len(items) > 0:
                    # Use the first item
                    item_id = items[0].get('id')
                    if item_id:
                        update_data = {
                            "price": 15.99,
                            "is_available": False
                        }
                        
                        update_response = self.make_request("PUT", f"/menu/item/{item_id}", update_data)
                        
                        if update_response.status_code == 200:
                            update_result = update_response.json()
                            self.log_test("Update Menu Item", True, 
                                        f"Menu item {item_id} updated successfully", update_result)
                        else:
                            self.log_test("Update Menu Item", False, 
                                        f"Update menu item failed with status {update_response.status_code}: {update_response.text}")
                    else:
                        self.log_test("Update Menu Item", False, "No item ID found in menu items")
                else:
                    self.log_test("Update Menu Item", False, "No menu items available to test update")
            else:
                self.log_test("Update Menu Item", False, "Could not retrieve menu items for update test")
        except Exception as e:
            self.log_test("Update Menu Item", False, f"Update menu item error: {str(e)}")
            
    def test_order_status_update(self):
        """Test updating order status"""
        if not self.token:
            self.log_test("Order Status Update", False, "No authentication token available")
            return
            
        try:
            # Get pending orders to test status update
            response = self.make_request("GET", "/orders/list?status=pending")
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list) and len(orders) > 0:
                    order_number = orders[0].get('orderNumber')
                    if order_number:
                        import urllib.parse
                        encoded_order_number = urllib.parse.quote(order_number, safe='')
                        
                        # Test status update from pending to accepted
                        update_data = {"status": "accepted"}
                        update_response = self.make_request("PATCH", f"/orders/{encoded_order_number}/status", update_data)
                        
                        if update_response.status_code == 200:
                            update_result = update_response.json()
                            if update_result.get('status') == 'accepted':
                                self.log_test("Order Status Update", True, 
                                            f"Order {order_number} status updated to accepted", update_result)
                            else:
                                self.log_test("Order Status Update", False, 
                                            f"Status update succeeded but status not changed: {update_result}")
                        else:
                            self.log_test("Order Status Update", False, 
                                        f"Order status update failed with status {update_response.status_code}: {update_response.text}")
                    else:
                        self.log_test("Order Status Update", False, "No order number found in pending orders")
                else:
                    self.log_test("Order Status Update", False, "No pending orders available to test status update")
            else:
                self.log_test("Order Status Update", False, "Could not retrieve pending orders for status update test")
        except Exception as e:
            self.log_test("Order Status Update", False, f"Order status update error: {str(e)}")
            
    def test_order_status_update_missing_status(self):
        """Test order status update with missing status field"""
        if not self.token:
            self.log_test("Order Status Update Missing Status", False, "No authentication token available")
            return
            
        try:
            # Get any order to test with
            response = self.make_request("GET", "/orders/list?status=all")
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list) and len(orders) > 0:
                    order_number = orders[0].get('orderNumber')
                    if order_number:
                        import urllib.parse
                        encoded_order_number = urllib.parse.quote(order_number, safe='')
                        
                        # Test with missing status field
                        update_data = {}  # Missing status
                        update_response = self.make_request("PATCH", f"/orders/{encoded_order_number}/status", update_data)
                        
                        if update_response.status_code == 400:
                            self.log_test("Order Status Update Missing Status", True, 
                                        "Correctly rejected status update with missing status field")
                        else:
                            self.log_test("Order Status Update Missing Status", False, 
                                        f"Expected 400, got {update_response.status_code}: {update_response.text}")
                    else:
                        self.log_test("Order Status Update Missing Status", False, "No order number found")
                else:
                    self.log_test("Order Status Update Missing Status", False, "No orders available for test")
            else:
                self.log_test("Order Status Update Missing Status", False, "Could not retrieve orders for test")
        except Exception as e:
            self.log_test("Order Status Update Missing Status", False, f"Missing status test error: {str(e)}")
            
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting GBC POS API Testing...")
        print(f"🔗 Base URL: {self.base_url}")
        print(f"👤 Username: {self.username}")
        print("=" * 80)
        
        # Health check (no auth required)
        self.test_health_check()
        
        # Authentication tests
        self.test_login_valid_credentials()
        self.test_login_invalid_credentials()
        self.test_login_missing_fields()
        self.test_protected_endpoint_without_token()
        
        # Dashboard tests (require auth)
        self.test_dashboard_stats()
        self.test_dashboard_top_dishes()
        self.test_dashboard_frequent_customers()
        
        # Orders tests (require auth)
        self.test_orders_list_all()
        self.test_orders_list_pending()
        self.test_orders_list_dispatched()
        self.test_order_detail()
        self.test_order_detail_nonexistent()
        
        # Menu tests (require auth)
        self.test_menu_items()
        self.test_add_menu_item()
        self.test_update_menu_item()
        
        # Order status update tests (require auth)
        self.test_order_status_update()
        self.test_order_status_update_missing_status()
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
                    
        print("\n" + "=" * 80)
        
        # Return exit code based on results
        return 0 if failed == 0 else 1

if __name__ == "__main__":
    tester = GBCPOSAPITester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)