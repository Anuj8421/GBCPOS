import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { analyticsService } from '@/services/analytics.service';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatRelativeTime, formatDate } from '@/utils/helpers';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  Package,
  Star,
  Users,
  AlertCircle,
  CalendarIcon,
  RefreshCw,
  ChefHat,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'delayed', 'disconnected'

  useEffect(() => {
    fetchDashboardData();
    // Update last sync time every minute
    const syncInterval = setInterval(() => {
      const timeSinceSync = Date.now() - lastSync.getTime();
      if (timeSinceSync > 5 * 60 * 1000) { // 5 minutes
        setSyncStatus('delayed');
      } else if (timeSinceSync > 15 * 60 * 1000) { // 15 minutes
        setSyncStatus('disconnected');
      } else {
        setSyncStatus('synced');
      }
    }, 60000);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchDashboardData();
      
      // Auto-refresh dashboard every 60 seconds
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [dateRange, restaurantId]);

  const fetchDashboardData = async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      
      // Format dates for API
      const startDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd 00:00:00') : null;
      const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd 23:59:59') : null;
      
      // Fetch dashboard stats
      const statsData = await orderService.getDashboardStats(restaurantId, startDate, endDate);
      setStats(statsData);
      
      // Fetch recent orders (limit to 10)
      const ordersData = await orderService.getOrders(restaurantId, null, 10);
      setRecentOrders(ordersData.orders || []);
      
      // Fetch top dishes and frequent customers
      const topDishesData = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/top-dishes?restaurant_id=${restaurantId}&start_date=${startDate}&end_date=${endDate}`)
        .then(res => res.json())
        .catch(() => ({ dishes: [] }));
      
      const frequentCustomersData = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/frequent-customers?restaurant_id=${restaurantId}&start_date=${startDate}&end_date=${endDate}`)
        .then(res => res.json())
        .catch(() => ({ customers: [] }));
      
      // Build summary data
      setSummary({
        todaySales: statsData.totalRevenue || 0,
        todayOrders: statsData.totalOrders || 0,
        pendingOrders: statsData.pendingOrders || 0,
        avgPrepTime: 18, // This would need to be calculated from order data
        completionRate: statsData.totalOrders > 0 
          ? Math.round((statsData.completedOrders / statsData.totalOrders) * 100)
          : 0,
        avgRating: 4.7, // This would come from reviews table
        activeCustomers: 0, // This would need to be counted from unique customers
        recentOrders: ordersData.orders?.slice(0, 3).map(order => ({
          id: order.orderNumber,
          customerName: order.customer?.name || 'Guest',
          status: order.status,
          total: order.amount,
          createdAt: order.createdAt
        })) || [],
        topDishes: topDishesData.dishes || [],
        frequentCustomers: frequentCustomersData.customers || []
      });
      
      setLastSync(new Date());
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setSyncStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Sales",
      value: formatCurrency(summary?.todaySales || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      testId: 'sales-card'
    },
    {
      title: "Orders",
      value: summary?.todayOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      testId: 'orders-card'
    },
    {
      title: 'Pending Orders',
      value: summary?.pendingOrders || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: (summary?.pendingOrders || 0) > 0 ? 'Action Required' : null,
      testId: 'pending-orders-card'
    },
    {
      title: 'Avg Prep Time',
      value: `${summary?.avgPrepTime || 0} min`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      testId: 'avg-prep-time-card'
    },
    {
      title: 'Completion Rate',
      value: `${summary?.completionRate || 0}%`,
      icon: Package,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      testId: 'completion-rate-card'
    },
    {
      title: 'Avg Rating',
      value: (summary?.avgRating || 0).toFixed(1),
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

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <RefreshCw className="w-3 h-3" />;
      case 'delayed':
        return <Clock className="w-3 h-3" />;
      case 'disconnected':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <RefreshCw className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header with Date Range and Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your restaurant performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
                data-testid="date-range-button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="p-3 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDateRange({ from: new Date(), to: new Date() })}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDateRange({ 
                    from: addDays(new Date(), -7), 
                    to: new Date() 
                  })}
                >
                  Last 7 Days
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDateRange({ 
                    from: addDays(new Date(), -30), 
                    to: new Date() 
                  })}
                >
                  Last 30 Days
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            data-testid="refresh-button"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>

          {/* Sync Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg" data-testid="sync-status">
            <div className="flex flex-col items-end">
              <Badge className={cn("text-xs", getSyncStatusColor())} data-testid="sync-status-badge">
                <span className="flex items-center gap-1">
                  {getSyncStatusIcon()}
                  {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
                </span>
              </Badge>
              <span className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(lastSync)}
              </span>
            </div>
          </div>
        </div>
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
            {(summary?.recentOrders || []).map((order) => (
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
            {(!summary?.recentOrders || summary.recentOrders.length === 0) && (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
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
              onClick={() => navigate('/orders')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
              data-testid="view-pending-orders-button"
            >
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900">View Pending Orders</p>
              <p className="text-sm text-gray-600 mt-1">{summary?.pendingOrders || 0} orders waiting</p>
            </button>
            <button
              onClick={() => navigate('/menu')}
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

      {/* Top Sold Dishes */}
      <Card data-testid="top-dishes-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Sold Dishes</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/analytics/top-dishes')}
            data-testid="view-all-dishes-button"
          >
            View All →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(summary?.topDishes || []).length > 0 ? (
              summary.topDishes.map((dish, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`top-dish-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
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
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dish.name}</p>
                      <p className="text-sm text-gray-600">{dish.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(dish.revenue)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No top dishes data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Most Frequent Customers */}
      <Card data-testid="frequent-customers-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Most Frequent Customers</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/analytics/frequent-customers')}
            data-testid="view-all-customers-button"
          >
            View All →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(summary?.frequentCustomers || []).length > 0 ? (
              summary.frequentCustomers.map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`frequent-customer-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-gray-500">{customer.orders} orders</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No frequent customers data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report an Issue */}
      <Card data-testid="report-issue-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Having issues with the app?</p>
                <p className="text-sm text-gray-600">Report technical problems or request support</p>
              </div>
            </div>
            <a
              href="mailto:support@gbcanteen.com?subject=POS App Issue Report&body=Please describe your issue:"
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              data-testid="report-issue-link"
            >
              <span className="font-medium">Report an Issue</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;