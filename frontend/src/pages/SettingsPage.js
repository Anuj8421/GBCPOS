import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Printer, RefreshCw, CheckCircle2, XCircle, Info, Save, Globe } from 'lucide-react';
import { printerService } from '@/services/printer.service';
import { toast } from 'sonner';
import axios from 'axios';

const SettingsPage = () => {
  const [backendUrl, setBackendUrl] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [printerAvailable, setPrinterAvailable] = useState(null);
  const [apiTests, setApiTests] = useState([]);

  useEffect(() => {
    // Load saved backend URL from localStorage or use default from env
    const savedUrl = localStorage.getItem('custom_backend_url') || process.env.REACT_APP_BACKEND_URL || '';
    setBackendUrl(savedUrl);
    setTempUrl(savedUrl);
  }, []);

  // Save backend URL
  const saveBackendUrl = () => {
    if (!tempUrl) {
      toast.error('Backend URL cannot be empty');
      return;
    }

    // Validate URL format
    try {
      new URL(tempUrl);
      localStorage.setItem('custom_backend_url', tempUrl);
      setBackendUrl(tempUrl);
      toast.success('Backend URL saved! Please refresh the page for changes to take effect.');
    } catch (error) {
      toast.error('Invalid URL format. Please enter a valid URL.');
    }
  };

  // Reset to default
  const resetToDefault = () => {
    const defaultUrl = process.env.REACT_APP_BACKEND_URL || '';
    setTempUrl(defaultUrl);
    localStorage.removeItem('custom_backend_url');
    setBackendUrl(defaultUrl);
    toast.success('Reset to default URL. Please refresh the page.');
  };

  // Get current backend URL
  const getCurrentBackendUrl = () => {
    return localStorage.getItem('custom_backend_url') || process.env.REACT_APP_BACKEND_URL || '';
  };

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
        toast.success(result.mock ? 'Test Print (Mock Mode - Check Console)' : 'Test Print Sent to Printer!');
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
    const currentUrl = getCurrentBackendUrl();
    
    try {
      const apiClient = axios.create({
        baseURL: `${currentUrl}/api`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      toast.info('Testing APIs...');

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
    <div className="space-y-6 p-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings & Testing</h1>
        <p className="text-gray-600 mt-1">Configure backend URL and test connections</p>
      </div>

      {/* Backend URL Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Backend Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url">Backend API URL</Label>
            <div className="flex gap-2">
              <Input
                id="backend-url"
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://13.200.235.81:8001"
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={saveBackendUrl} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Current: <span className="font-mono">{backendUrl || 'Not set'}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetToDefault} variant="outline" size="sm">
              Reset to Default
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload App
            </Button>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> After changing the URL, click "Reload App" to apply changes. No rebuild needed!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Active Backend URL:</span>
            <span className="text-sm text-gray-600 font-mono text-right truncate max-w-xs">{getCurrentBackendUrl()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Auth Token:</span>
            <span className={`text-sm font-semibold ${localStorage.getItem('auth_token') ? 'text-green-600' : 'text-red-600'}`}>
              {localStorage.getItem('auth_token') ? '✓ Present' : '✗ Missing - Please Login'}
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
            Test the iMin Swift 2 Pro printer. On device: prints to physical printer. In browser: simulates printing.
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
                    ? 'iMin Printer is available and ready' 
                    : 'Mock mode - Check browser console for output'}
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
            <Settings className="w-5 h-5" />
            API Connection Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Test all backend endpoints to verify connectivity. Make sure you're logged in first!
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
                  <span className="text-xs text-gray-600 max-w-xs truncate">
                    {test.status === 'success' 
                      ? (test.count !== undefined ? `${test.count} items` : '✓ OK')
                      : test.error}
                  </span>
                </div>
              ))}
              
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Summary:</strong> {apiTests.filter(t => t.status === 'success').length}/{apiTests.length} tests passed
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;