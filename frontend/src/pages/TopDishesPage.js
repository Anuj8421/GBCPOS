import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/helpers';
import { ArrowLeft, ChefHat, TrendingUp, Package } from 'lucide-react';
import { toast } from 'sonner';

const TopDishesPage = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchTopDishes();
  }, [dateRange]);

  const fetchTopDishes = async () => {
    try {
      setLoading(true);
      // Mock expanded data - will be replaced with real API
      const mockDishes = [
        { rank: 1, name: 'Paneer Tikka Masala', orders: 24, revenue: 993.60, avgPrice: 41.40, image: 'https://storage.googleapis.com/food_order_php_app/dishes/68c86a47a3ac4_Paneer_Tikka_Masala-removebg-preview.jpg', category: 'GBC Specialities', trend: '+12%' },
        { rank: 2, name: 'Vegetable Masala', orders: 18, revenue: 183.60, avgPrice: 10.20, image: 'https://storage.googleapis.com/food_order_php_app/dishes/68c86959c4af2_Vegetable_Masala-removebg-preview.jpg', category: 'GBC Specialities', trend: '+8%' },
        { rank: 3, name: 'Butter Chicken', orders: 15, revenue: 621.00, avgPrice: 41.40, image: null, category: 'Mains', trend: '+5%' },
        { rank: 4, name: 'Chicken Tikka', orders: 14, revenue: 420.00, avgPrice: 30.00, image: null, category: 'Starters', trend: '+15%' },
        { rank: 5, name: 'Garlic Naan', orders: 32, revenue: 160.00, avgPrice: 5.00, image: null, category: 'Breads', trend: '+3%' },
        { rank: 6, name: 'Biryani', orders: 12, revenue: 468.00, avgPrice: 39.00, image: null, category: 'Mains', trend: '+10%' },
        { rank: 7, name: 'Samosa (3pc)', orders: 22, revenue: 154.00, avgPrice: 7.00, image: null, category: 'Starters', trend: '+7%' },
        { rank: 8, name: 'Dal Makhani', orders: 10, revenue: 130.00, avgPrice: 13.00, image: null, category: 'Mains', trend: '-2%' },
        { rank: 9, name: 'Mango Lassi', orders: 28, revenue: 168.00, avgPrice: 6.00, image: null, category: 'Drinks', trend: '+20%' },
        { rank: 10, name: 'Gulab Jamun', orders: 16, revenue: 112.00, avgPrice: 7.00, image: null, category: 'Desserts', trend: '+4%' },
        { rank: 11, name: 'Tandoori Roti', orders: 25, revenue: 75.00, avgPrice: 3.00, image: null, category: 'Breads', trend: '+1%' },
        { rank: 12, name: 'Aloo Gobi', orders: 8, revenue: 96.00, avgPrice: 12.00, image: null, category: 'Mains', trend: '-5%' },
        { rank: 13, name: 'Raita', orders: 20, revenue: 60.00, avgPrice: 3.00, image: null, category: 'Sides', trend: '+2%' },
        { rank: 14, name: 'Chicken 65', orders: 11, revenue: 165.00, avgPrice: 15.00, image: null, category: 'Starters', trend: '+9%' },
        { rank: 15, name: 'Palak Paneer', orders: 9, revenue: 126.00, avgPrice: 14.00, image: null, category: 'Mains', trend: '+6%' }
      ];
      setDishes(mockDishes);
    } catch (error) {
      toast.error('Failed to load top dishes');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTotalStats = () => {
    const totalOrders = dishes.reduce((sum, dish) => sum + dish.orders, 0);
    const totalRevenue = dishes.reduce((sum, dish) => sum + dish.revenue, 0);
    return { totalOrders, totalRevenue };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="top-dishes-page">
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
            <h1 className="text-2xl font-bold text-gray-900">Top Sold Dishes</h1>
            <p className="text-gray-600 mt-1">Complete ranking of best-selling items</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dishes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{dishes.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-orange-600" />
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
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
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
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dishes List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Dishes Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div
                  key={dish.rank}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`dish-rank-${dish.rank}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Rank Badge */}
                    <div className="relative flex-shrink-0">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                          <ChefHat className="w-8 h-8 text-orange-600" />
                        </div>
                      )}
                      <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {dish.rank}
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{dish.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {dish.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-600">{dish.orders} orders</p>
                        <p className="text-sm text-gray-600">Avg: {formatCurrency(dish.avgPrice)}</p>
                        <p className={`text-sm font-medium ${getTrendColor(dish.trend)}`}>
                          {dish.trend}
                        </p>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">{formatCurrency(dish.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
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

export default TopDishesPage;