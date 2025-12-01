import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { apiClient, BACKEND_URL, API_BASE } from '../services/api';

const DebugPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      status,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testEndpoint = async (name, method, endpoint, requiresAuth = true) => {
    setLoading(true);
    try {
      let response;
      const token = localStorage.getItem('auth_token');
      
      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else if (method === 'POST') {
        response = await apiClient.post(endpoint, {});
      }
      
      addResult(name, 'success', {
        endpoint,
        method,
        token: token ? `${token.substring(0, 20)}...` : 'No token',
        status: response.status,
        data: response.data
      });
    } catch (error) {
      addResult(name, 'error', {
        endpoint,
        method,
        status: error.response?.status,
        message: error.message,
        details: error.response?.data
      }, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    
    // Test 1: Backend URL
    addResult('Configuration', 'info', {
      backendUrl: BACKEND_URL,
      apiBase: API_BASE,
      token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
    });

    // Test 2: Health Check (no auth)
    await testEndpoint('Health Check', 'GET', '/health', false);

    // Test 3: Orders List
    await testEndpoint('Orders List', 'GET', '/orders/list?status=all');

    // Test 4: Dashboard Stats
    await testEndpoint('Dashboard Stats', 'GET', '/dashboard/stats');

    // Test 5: Menu Items
    await testEndpoint('Menu Items', 'GET', '/menu/items');

    // Test 6: Top Dishes
    await testEndpoint('Top Dishes', 'GET', '/dashboard/top-dishes');

    // Test 7: Frequent Customers
    await testEndpoint('Frequent Customers', 'GET', '/dashboard/frequent-customers');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Debug Console</h1>
          <p className="text-gray-600 mt-1">Test your backend API endpoints</p>
        </div>
        <div className="space-x-2">
          <Button onClick={clearResults} variant="outline" disabled={loading}>
            Clear Results
          </Button>
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? 'Testing...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Configuration Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Current Configuration</h3>
        <div className="space-y-1 text-sm font-mono">
          <div><strong>Backend URL:</strong> {BACKEND_URL}</div>
          <div><strong>API Base:</strong> {API_BASE}</div>
          <div><strong>Auth Token:</strong> {localStorage.getItem('auth_token') ? 
            <span className="text-green-600">✓ Present</span> : 
            <span className="text-red-600">✗ Missing</span>}
          </div>
        </div>
      </Card>

      {/* Individual Test Buttons */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Individual Tests</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={() => testEndpoint('Health Check', 'GET', '/health', false)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Health Check
          </Button>
          <Button 
            onClick={() => testEndpoint('Orders List', 'GET', '/orders/list?status=all')}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Orders
          </Button>
          <Button 
            onClick={() => testEndpoint('Dashboard Stats', 'GET', '/dashboard/stats')}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Dashboard
          </Button>
          <Button 
            onClick={() => testEndpoint('Menu Items', 'GET', '/menu/items')}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Menu
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <Card 
            key={index}
            className={`p-4 ${
              result.status === 'success' ? 'border-green-500 bg-green-50' :
              result.status === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{result.test}</h4>
                <p className="text-xs text-gray-500">{result.timestamp}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                result.status === 'success' ? 'bg-green-600 text-white' :
                result.status === 'error' ? 'bg-red-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {result.status.toUpperCase()}
              </span>
            </div>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
            {result.error && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                <strong>Error:</strong> {result.error.message}
              </div>
            )}
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <p>No tests run yet. Click "Run All Tests" to start debugging.</p>
        </Card>
      )}
    </div>
  );
};

export default DebugPage;
