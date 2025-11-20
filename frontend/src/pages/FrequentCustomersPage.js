import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPhoneNumber } from '@/utils/helpers';
import { ArrowLeft, Users, DollarSign, ShoppingCart, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const FrequentCustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFrequentCustomers();
  }, []);

  const fetchFrequentCustomers = async () => {
    try {
      setLoading(true);
      // Mock expanded data - will be replaced with real API
      const mockCustomers = [
        { rank: 1, name: 'John Smith', orders: 12, totalSpent: 456.80, avgOrderValue: 38.07, phone: '+449526315487', email: 'john.smith@email.com', lastOrder: '2 days ago', favoriteItem: 'Paneer Tikka' },
        { rank: 2, name: 'Sarah Johnson', orders: 8, totalSpent: 342.50, avgOrderValue: 42.81, phone: '+449526315488', email: 'sarah.j@email.com', lastOrder: '1 day ago', favoriteItem: 'Vegetable Masala' },
        { rank: 3, name: 'Mike Davis', orders: 6, totalSpent: 289.30, avgOrderValue: 48.22, phone: '+449526315489', email: 'mike.d@email.com', lastOrder: '3 days ago', favoriteItem: 'Butter Chicken' },
        { rank: 4, name: 'Emily Brown', orders: 7, totalSpent: 267.90, avgOrderValue: 38.27, phone: '+449526315490', email: 'emily.b@email.com', lastOrder: '1 week ago', favoriteItem: 'Biryani' },
        { rank: 5, name: 'David Wilson', orders: 5, totalSpent: 245.00, avgOrderValue: 49.00, phone: '+449526315491', email: 'david.w@email.com', lastOrder: '4 days ago', favoriteItem: 'Chicken Tikka' },
        { rank: 6, name: 'Lisa Anderson', orders: 6, totalSpent: 234.60, avgOrderValue: 39.10, phone: '+449526315492', email: 'lisa.a@email.com', lastOrder: '5 days ago', favoriteItem: 'Dal Makhani' },
        { rank: 7, name: 'Robert Taylor', orders: 4, totalSpent: 198.40, avgOrderValue: 49.60, phone: '+449526315493', email: 'robert.t@email.com', lastOrder: '1 week ago', favoriteItem: 'Tandoori Chicken' },
        { rank: 8, name: 'Jennifer Martinez', orders: 5, totalSpent: 187.50, avgOrderValue: 37.50, phone: '+449526315494', email: 'jennifer.m@email.com', lastOrder: '3 days ago', favoriteItem: 'Samosa' },
        { rank: 9, name: 'William Garcia', orders: 4, totalSpent: 176.80, avgOrderValue: 44.20, phone: '+449526315495', email: 'william.g@email.com', lastOrder: '6 days ago', favoriteItem: 'Naan' },
        { rank: 10, name: 'Maria Rodriguez', orders: 5, totalSpent: 165.25, avgOrderValue: 33.05, phone: '+449526315496', email: 'maria.r@email.com', lastOrder: '2 days ago', favoriteItem: 'Aloo Gobi' },
        { rank: 11, name: 'James Thompson', orders: 3, totalSpent: 152.70, avgOrderValue: 50.90, phone: '+449526315497', email: 'james.t@email.com', lastOrder: '1 week ago', favoriteItem: 'Lamb Curry' },
        { rank: 12, name: 'Patricia White', orders: 4, totalSpent: 148.00, avgOrderValue: 37.00, phone: '+449526315498', email: 'patricia.w@email.com', lastOrder: '8 days ago', favoriteItem: 'Palak Paneer' },
        { rank: 13, name: 'Christopher Lee', orders: 3, totalSpent: 132.90, avgOrderValue: 44.30, phone: '+449526315499', email: 'chris.l@email.com', lastOrder: '5 days ago', favoriteItem: 'Chicken 65' },
        { rank: 14, name: 'Linda Harris', orders: 4, totalSpent: 128.40, avgOrderValue: 32.10, phone: '+449526315500', email: 'linda.h@email.com', lastOrder: '4 days ago', favoriteItem: 'Raita' },
        { rank: 15, name: 'Michael Clark', orders: 3, totalSpent: 117.00, avgOrderValue: 39.00, phone: '+449526315501', email: 'michael.c@email.com', lastOrder: '1 week ago', favoriteItem: 'Gulab Jamun' }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalOrders = customers.reduce((sum, customer) => sum + customer.orders, 0);
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const avgOrderValue = totalRevenue / totalOrders || 0;
    return { totalOrders, totalRevenue, avgOrderValue };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="frequent-customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Frequent Customers</h1>
            <p className="text-gray-600 mt-1">Complete ranking of most loyal customers</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Customers Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.rank}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`customer-rank-${customer.rank}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Rank & Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {customer.rank}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {customer.favoriteItem}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Last order: {customer.lastOrder}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-sm text-gray-600">{customer.orders} orders</p>
                      <p className="text-xs text-gray-500">Avg: {formatCurrency(customer.avgOrderValue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FrequentCustomersPage;