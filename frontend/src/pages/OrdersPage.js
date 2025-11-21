import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderService } from '@/services/order.service';
import { printerService } from '@/services/printer.service';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { Clock, Phone, MapPin, Package, Printer } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(ORDER_STATUS.ALL);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders(activeTab);
    }
  }, [activeTab, restaurantId]);

  const fetchOrders = async (status) => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const statusFilter = status === ORDER_STATUS.ALL ? null : status;
      const response = await orderService.getOrders(restaurantId, statusFilter, 100);
      
      // Transform API data to match component expectations
      const transformedOrders = (response.orders || []).map(order => {
        // Parse items if it's a JSON string
        let items = [];
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
          console.error('Error parsing order items:', e);
        }
        
        return {
          id: order.orderNumber,
          customerName: order.customer?.name || 'Guest',
          customerPhone: order.customer?.phone || '',
          deliveryAddress: order.customer?.address || '',
          status: order.status,
          total: order.amount,
          subtotal: order.amount, // Calculate properly if you have breakdown
          tax: 0,
          deliveryFee: 0,
          items: items.map(item => ({
            name: item.dish_name || item.name || 'Item',
            quantity: item.quantity || 1,
            price: parseFloat(item.unit_price || item.price || 0),
            modifiers: item.customizations || []
          })),
          createdAt: order.createdAt,
          acceptedAt: order.approvedAt,
          readyAt: order.readyAt,
          dispatchedAt: order.dispatchedAt,
          prepTime: null
        };
      });
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const handlePrintKitchenReceipt = async (order) => {
    const result = await printerService.printKitchenReceipt(order);
    if (result.success) {
      toast.success('Kitchen receipt printed');
    } else {
      toast.error('Failed to print: ' + result.error);
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusCount = (status) => {
    if (status === ORDER_STATUS.ALL) return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track all your orders</p>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="orders-tabs">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value={ORDER_STATUS.ALL} data-testid="tab-all">
            All ({getStatusCount(ORDER_STATUS.ALL)})
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.PENDING} data-testid="tab-pending">
            Pending
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.ACCEPTED} data-testid="tab-accepted">
            Accepted
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.READY} data-testid="tab-ready">
            Ready
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.DELIVERED} data-testid="tab-delivered">
            Delivered
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.CANCELLED} data-testid="tab-cancelled">
            Cancelled
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.REFUNDED} data-testid="tab-refunded">
            Refunded
          </TabsTrigger>
          <TabsTrigger value={ORDER_STATUS.SCHEDULED} data-testid="tab-scheduled">
            Scheduled
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No {ORDER_STATUS_LABELS[activeTab].toLowerCase()}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(order.id)}
                  data-testid={`order-card-${order.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                          <Badge className={ORDER_STATUS_COLORS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatRelativeTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                        {order.prepTime && (
                          <div className="flex items-center justify-end space-x-1 text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{order.prepTime} min</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-gray-500">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div>
                              <span className="text-gray-700">
                                {item.quantity}x {item.name}
                              </span>
                              {item.modifiers && item.modifiers.length > 0 && (
                                <p className="text-xs text-gray-500 ml-4">
                                  {item.modifiers.join(', ')}
                                </p>
                              )}
                            </div>
                            <span className="text-gray-700">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(order.id);
                          }}
                          data-testid={`accept-order-${order.id}`}
                        >
                          Accept Order
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(order.id);
                          }}
                          data-testid={`decline-order-${order.id}`}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintKitchenReceipt(order);
                          }}
                          data-testid={`print-receipt-${order.id}`}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {order.status === 'accepted' && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(order.id);
                        }}
                        data-testid={`mark-ready-${order.id}`}
                      >
                        Mark as Ready
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;