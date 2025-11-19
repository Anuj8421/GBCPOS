import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyticsService } from '@/services/analytics.service';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  Package,
  Star,
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // const data = await analyticsService.getDashboardSummary();
      // setSummary(data);
      
      // Mock data for now - will be replaced with real data from PHP backend
      setSummary({
        todaySales: 1250.50,
        todayOrders: 48,
        pendingOrders: 5,
        avgPrepTime: 18,
        completionRate: 95,
        avgRating: 4.7,
        activeCustomers: 156,
        recentOrders: [
          {
            id: 'ORD12345',
            customerName: 'John Smith',
            status: 'pending',
            total: 45.99,
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          {
            id: 'ORD12346',
            customerName: 'Sarah Johnson',
            status: 'accepted',
            total: 32.50,
            createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
          },
          {
            id: 'ORD12347',
            customerName: 'Mike Davis',
            status: 'ready',
            total: 67.25,
            createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(summary.todaySales),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      testId: 'today-sales-card'
    },
    {
      title: "Today's Orders",
      value: summary.todayOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      testId: 'today-orders-card'
    },
    {
      title: 'Pending Orders',
      value: summary.pendingOrders,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: summary.pendingOrders > 0 ? 'Action Required' : null,
      testId: 'pending-orders-card'
    },
    {
      title: 'Avg Prep Time',
      value: `${summary.avgPrepTime} min`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      testId: 'avg-prep-time-card'
    },
    {
      title: 'Completion Rate',
      value: `${summary.completionRate}%`,
      icon: Package,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      testId: 'completion-rate-card'
    },
    {
      title: 'Avg Rating',
      value: summary.avgRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      testId: 'avg-rating-card'
    }
  ];

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-testid={stat.testId}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  {stat.badge && (
                    <Badge variant="destructive" className="text-xs">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card data-testid="recent-orders-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                data-testid={`order-${order.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusBadgeColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card data-testid="quick-actions-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
              data-testid="view-pending-orders-button"
            >
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900">View Pending Orders</p>
              <p className="text-sm text-gray-600 mt-1">{summary.pendingOrders} orders waiting</p>
            </button>
            <button
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
              data-testid="manage-menu-button"
            >
              <Package className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Manage Menu</p>
              <p className="text-sm text-gray-600 mt-1">Update items & prices</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;