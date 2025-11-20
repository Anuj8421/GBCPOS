import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderService } from '@/services/order.service';
import { printerService } from '@/services/printer.service';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { Clock, Phone, MapPin, Package, Printer } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(ORDER_STATUS.ALL);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      // const data = await orderService.getOrders(status === ORDER_STATUS.ALL ? null : status);
      // setOrders(data);

      // Mock data - will be replaced with real PHP backend data
      const mockOrders = [
        {
          id: 'ORD12345',
          customerName: 'John Smith',
          customerPhone: '(555) 123-4567',
          deliveryAddress: '123 Main St, Apt 4B',
          status: 'pending',
          total: 45.99,
          subtotal: 39.99,
          tax: 3.00,
          deliveryFee: 3.00,
          items: [
            { name: 'Burger Deluxe', quantity: 2, price: 12.99, modifiers: ['No onions', 'Extra cheese'] },
            { name: 'French Fries', quantity: 2, price: 4.99 },
            { name: 'Coca Cola', quantity: 2, price: 2.50 }
          ],
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          prepTime: null
        },
        {
          id: 'ORD12346',
          customerName: 'Sarah Johnson',
          customerPhone: '(555) 234-5678',
          deliveryAddress: '456 Oak Ave',
          status: 'accepted',
          total: 32.50,
          subtotal: 28.00,
          tax: 2.10,
          deliveryFee: 2.40,
          items: [
            { name: 'Caesar Salad', quantity: 1, price: 10.99 },
            { name: 'Grilled Chicken', quantity: 1, price: 14.99 },
            { name: 'Iced Tea', quantity: 1, price: 2.02 }
          ],
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acceptedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
          prepTime: 20
        },
        {
          id: 'ORD12347',
          customerName: 'Mike Davis',
          customerPhone: '(555) 345-6789',
          deliveryAddress: '789 Pine Rd',
          status: 'ready',
          total: 67.25,
          subtotal: 58.00,
          tax: 4.35,
          deliveryFee: 4.90,
          items: [
            { name: 'Family Pizza', quantity: 1, price: 28.99 },
            { name: 'Wings (20pc)', quantity: 1, price: 18.99 },
            { name: 'Garlic Bread', quantity: 2, price: 5.01 }
          ],
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          acceptedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          readyAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          prepTime: 35
        },
        {
          id: 'ORD12348',
          customerName: 'Emily Brown',
          customerPhone: '(555) 456-7890',
          deliveryAddress: '321 Elm Street',
          status: 'scheduled',
          total: 38.75,
          subtotal: 33.00,
          tax: 2.75,
          deliveryFee: 3.00,
          items: [
            { name: 'Spaghetti Carbonara', quantity: 1, price: 18.00 },
            { name: 'Garlic Bread', quantity: 1, price: 5.00 },
            { name: 'Tiramisu', quantity: 1, price: 10.00 }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          prepTime: 25
        },
        {
          id: 'ORD12349',
          customerName: 'David Wilson',
          customerPhone: '(555) 567-8901',
          deliveryAddress: '654 Maple Drive',
          status: 'delivered',
          total: 52.30,
          subtotal: 45.00,
          tax: 3.30,
          deliveryFee: 4.00,
          items: [
            { name: 'Chicken Tikka', quantity: 2, price: 15.00 },
            { name: 'Naan Bread', quantity: 3, price: 5.00 }
          ],
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          acceptedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
          readyAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          prepTime: 30
        },
        {
          id: 'ORD12350',
          customerName: 'Lisa Anderson',
          customerPhone: '(555) 678-9012',
          deliveryAddress: '987 Birch Lane',
          status: 'delivered',
          total: 28.50,
          subtotal: 24.00,
          tax: 1.90,
          deliveryFee: 2.60,
          items: [
            { name: 'Margherita Pizza', quantity: 1, price: 14.00 },
            { name: 'Caesar Salad', quantity: 1, price: 10.00 }
          ],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          acceptedAt: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(),
          readyAt: new Date(Date.now() - 4.3 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          prepTime: 25
        },
        {
          id: 'ORD12351',
          customerName: 'Robert Taylor',
          customerPhone: '(555) 789-0123',
          deliveryAddress: '147 Cedar Court',
          status: 'cancelled',
          total: 41.20,
          subtotal: 36.00,
          tax: 2.70,
          deliveryFee: 2.50,
          items: [
            { name: 'Beef Burger', quantity: 2, price: 18.00 }
          ],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          cancelledAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
          cancelReason: 'Customer requested cancellation',
          prepTime: null
        },
        {
          id: 'ORD12352',
          customerName: 'Jennifer Martinez',
          customerPhone: '(555) 890-1234',
          deliveryAddress: '258 Willow Way',
          status: 'cancelled',
          total: 35.80,
          subtotal: 31.00,
          tax: 2.30,
          deliveryFee: 2.50,
          items: [
            { name: 'Vegetable Curry', quantity: 1, price: 16.00 },
            { name: 'Rice', quantity: 2, price: 7.50 }
          ],
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          cancelledAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
          cancelReason: 'Item unavailable',
          prepTime: null
        },
        {
          id: 'ORD12353',
          customerName: 'William Garcia',
          customerPhone: '(555) 901-2345',
          deliveryAddress: '369 Spruce Street',
          status: 'refunded',
          total: 48.90,
          subtotal: 42.00,
          tax: 3.40,
          deliveryFee: 3.50,
          items: [
            { name: 'Seafood Platter', quantity: 1, price: 42.00 }
          ],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          refundedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          refundReason: 'Quality issue reported by customer',
          prepTime: 40
        },
        {
          id: 'ORD12354',
          customerName: 'Maria Rodriguez',
          customerPhone: '(555) 012-3456',
          deliveryAddress: '741 Ash Avenue',
          status: 'refunded',
          total: 31.25,
          subtotal: 27.00,
          tax: 2.05,
          deliveryFee: 2.20,
          items: [
            { name: 'Club Sandwich', quantity: 1, price: 12.00 },
            { name: 'French Fries', quantity: 1, price: 5.00 },
            { name: 'Smoothie', quantity: 1, price: 10.00 }
          ],
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
          refundedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
          refundReason: 'Order delivered late',
          prepTime: 20
        }
      ];

      // Filter based on status
      const filteredOrders = status === ORDER_STATUS.ALL 
        ? mockOrders 
        : mockOrders.filter(o => o.status === status);
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
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