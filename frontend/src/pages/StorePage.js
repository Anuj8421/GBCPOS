import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Printer, RefreshCw, CheckCircle2, XCircle, Info } from 'lucide-react';
import { printerService } from '@/services/printer.service';
import { apiClient, BACKEND_URL } from '@/services/api';
import { toast } from 'sonner';

const StorePage = () => {
  const [testing, setTesting] = useState(false);
  const [printerAvailable, setPrinterAvailable] = useState(null);
  const [apiTests, setApiTests] = useState([]);

  // Check printer availability
  const checkPrinter = () => {
    const available = printerService.isPrinterAvailable();
    setPrinterAvailable(available);
    toast[available ? 'success' : 'info'](
      available ? 'iMin Printer Detected' : 'Running in Mock Mode (Browser)'
    );
  };

  // Test printer
  const testPrint = async () => {
    setTesting(true);
    try {
      const result = await printerService.testPrint();
      if (result.success) {
        toast.success(result.mock ? 'Test Print (Mock Mode)' : 'Test Print Sent to Printer!');
      } else {
        toast.error(`Print Failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Print Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  // Test backend APIs
  const testAPIs = async () => {
    setTesting(true);
    const results = [];
    
    try {
      // Test 1: Health Check
      try {
        const health = await apiClient.get('/health');
        results.push({ name: 'Health Check', status: 'success', data: health.data });
      } catch (err) {
        results.push({ name: 'Health Check', status: 'error', error: err.message });
      }

      // Test 2: Dashboard Stats
      try {
        const stats = await apiClient.get('/dashboard/stats');
        results.push({ name: 'Dashboard Stats', status: 'success', data: stats.data });
      } catch (err) {
        results.push({ name: 'Dashboard Stats', status: 'error', error: err.message });
      }

      // Test 3: Orders List
      try {
        const orders = await apiClient.get('/orders/list?status=all');
        results.push({ name: 'Orders List', status: 'success', count: orders.data.length });
      } catch (err) {
        results.push({ name: 'Orders List', status: 'error', error: err.message });
      }

      // Test 4: Menu Items
      try {
        const menu = await apiClient.get('/menu/items');
        results.push({ name: 'Menu Items', status: 'success', count: menu.data.length });
      } catch (err) {
        results.push({ name: 'Menu Items', status: 'error', error: err.message });
      }

      setApiTests(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      toast[successCount === results.length ? 'success' : 'warning'](
        `API Tests Complete: ${successCount}/${results.length} passed`
      );
    } catch (error) {
      toast.error('API Testing Failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="store-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings & Testing</h1>
        <p className="text-gray-600 mt-1">Test printer and API connections</p>
      </div>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Backend URL:</span>
            <span className="text-sm text-gray-600 font-mono">{BACKEND_URL}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Auth Token:</span>
            <span className={`text-sm font-semibold ${localStorage.getItem('auth_token') ? 'text-green-600' : 'text-red-600'}`}>
              {localStorage.getItem('auth_token') ? '✓ Present' : '✗ Missing'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Printer Mode:</span>
            <span className="text-sm text-gray-600">
              {printerAvailable === null ? 'Not Checked' : printerAvailable ? 'iMin Device' : 'Browser (Mock)'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Printer Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Printer Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test the iMin Swift 2 Pro printer integration. When running on the device, this will print to the physical printer. 
            In browser mode, it will simulate printing.
          </p>
          <div className="flex gap-3">
            <Button onClick={checkPrinter} variant="outline" disabled={testing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Printer
            </Button>
            <Button onClick={testPrint} disabled={testing}>
              <Printer className="w-4 h-4 mr-2" />
              {testing ? 'Printing...' : 'Test Print'}
            </Button>
          </div>
          {printerAvailable !== null && (
            <div className={`p-3 rounded-lg ${printerAvailable ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
              <div className="flex items-center gap-2">
                {printerAvailable ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {printerAvailable 
                    ? 'iMin Printer is available and ready to print' 
                    : 'Running in mock mode - Print output will be logged to console'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            API Connection Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test all backend API endpoints to verify connectivity and authentication.
          </p>
          <Button onClick={testAPIs} disabled={testing} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            {testing ? 'Testing APIs...' : 'Run API Tests'}
          </Button>

          {apiTests.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-semibold">Test Results:</h4>
              {apiTests.map((test, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    test.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {test.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{test.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {test.status === 'success' 
                      ? (test.count ? `${test.count} items` : '✓ OK')
                      : test.error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Settings Placeholder */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <Store className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Store Settings Coming Soon</p>
          <p className="text-gray-400 text-sm mt-2">Hours, Info, and Preferences</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorePage;