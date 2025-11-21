import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { orderService } from '@/services/order.service';
import { printerService } from '@/services/printer.service';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/helpers';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { ArrowLeft, Clock, Phone, MapPin, Printer, Check, X, Truck, Tag } from 'lucide-react';
import { toast } from 'sonner';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const restaurantId = user?.restaurant_id;
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepTime, setPrepTime] = useState(20);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Mock driver list
  const drivers = [
    { id: 'driver1', name: 'John Driver', phone: '+44 7700 900001' },
    { id: 'driver2', name: 'Sarah Rider', phone: '+44 7700 900002' },
    { id: 'driver3', name: 'Mike Courier', phone: '+44 7700 900003' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      // Add # prefix if not present (orderId from URL doesn't have it)
      const orderNumber = orderId.startsWith('#') ? orderId : `#${orderId}`;
      const orderData = await orderService.getOrderByNumber(restaurantId, orderNumber);
      
      if (!orderData) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }
      
      // Parse items if they're a JSON string
      let parsedItems = [];
      if (typeof orderData.items === 'string') {
        try {
          parsedItems = JSON.parse(orderData.items);
        } catch (e) {
          console.error('Error parsing items:', e);
          parsedItems = [];
        }
      } else {
        parsedItems = orderData.items || [];
      }
      
      // Transform API data to match component expectations
      const transformedOrder = {
        ...orderData,
        customerName: orderData.customer?.name || 'Guest',
        customerPhone: orderData.customer?.phone || '',
        customerEmail: orderData.customer?.email || '',
        deliveryAddress: orderData.customer?.address || '',
        total: orderData.amount || 0,
        subtotal: orderData.amount || 0, // Calculate properly if you have breakdown
        tax: 0,
        deliveryFee: 0,
        items: parsedItems.map(item => ({
          name: item.dish_name || item.name || 'Item',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.unit_price || item.price || 0),
          modifiers: item.customizations || []
        })),
        acceptedAt: orderData.approvedAt,
        prepTime: null
      };
      
      setOrder(transformedOrder);
      setLoading(false);
      return;
      
      // OLD MOCK DATA - keeping for reference
      let mockStatus = 'pending';
      let mockAcceptedAt = null;
      let mockReadyAt = null;
      let mockScheduledFor = null;
      let mockDeliveredAt = null;
      let mockCancelledAt = null;
      let mockRefundedAt = null;
      let additionalData = {};
      
      // For testing different statuses based on order ID
      if (orderId.includes('12346')) {
        mockStatus = 'accepted';
        mockAcceptedAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      } else if (orderId.includes('12347')) {
        mockStatus = 'ready';
        mockAcceptedAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
        mockReadyAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      } else if (orderId.includes('12348')) {
        mockStatus = 'scheduled';
        mockScheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      } else if (orderId.includes('12349')) {
        mockStatus = 'delivered';
        mockAcceptedAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        mockReadyAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        mockDeliveredAt = new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString();
        additionalData = {
          deliveredBy: 'John Driver',
          deliveryProofPhoto: '/mock-delivery-proof.jpg',
          deliveryNotes: 'Left at door as requested',
          otpVerified: true,
          customerRating: 5,
          customerReview: 'Excellent service! Food was hot and delicious.'
        };
      } else if (orderId.includes('12351')) {
        mockStatus = 'cancelled';
        mockCancelledAt = new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString();
        additionalData = {
          whoCancelled: 'Customer cancelled',
          cancellationReason: 'Customer request'
        };
      } else if (orderId.includes('12353')) {
        mockStatus = 'refunded';
        mockDeliveredAt = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
        mockRefundedAt = new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString();
        additionalData = {
          refundAmount: 48.90,
          refundType: 'Full refund',
          refundMethod: 'Back to card',
          refundReason: 'Customer complaint',
          refundProcessedBy: 'System Admin'
        };
      }
      
      const mockOrder = {
        id: orderId,
        customerName: 'John Smith',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john.smith@email.com',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        status: mockStatus,
        total: 45.99,
        subtotal: 39.99,
        tax: 3.00,
        deliveryFee: 3.00,
        paymentMethod: 'Credit Card',
        items: [
          { 
            name: 'Burger Deluxe', 
            quantity: 2, 
            price: 12.99, 
            modifiers: ['No onions', 'Extra cheese'],
            notes: 'Please make it well done'
          },
          { name: 'French Fries', quantity: 2, price: 4.99 },
          { name: 'Coca Cola', quantity: 2, price: 2.50 }
        ],
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acceptedAt: mockAcceptedAt,
        readyAt: mockReadyAt,
        scheduledFor: mockScheduledFor,
        deliveredAt: mockDeliveredAt,
        cancelledAt: mockCancelledAt,
        refundedAt: mockRefundedAt,
        prepTime: 20,
        specialInstructions: 'Please ring doorbell twice',
        storeName: 'General Bilimoria\'s Canteen',
        storeAddress: '18 Leeming Road, Borehamwood',
        ...additionalData
      };
      setOrder(mockOrder);
      setPrepTime(mockOrder.prepTime);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!restaurantId) return;
    
    try {
      setProcessing(true);
      const orderNumber = orderId.startsWith('#') ? orderId : `#${orderId}`;
      await orderService.updateOrderStatus(restaurantId, orderNumber, 'approved', user?.username || 'pos_app');
      
      // Print kitchen receipt automatically
      await printerService.printKitchenReceipt(order);
      
      toast.success(`Order accepted! Prep time: ${prepTime} min`);
      navigate('/orders');
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    if (!restaurantId) return;

    try {
      setProcessing(true);
      const orderNumber = orderId.startsWith('#') ? orderId : `#${orderId}`;
      await orderService.updateOrderStatus(restaurantId, orderNumber, 'cancelled', user?.username || 'pos_app');
      
      toast.success('Order declined');
      navigate('/orders');
    } catch (error) {
      console.error('Error declining order:', error);
      toast.error('Failed to decline order');
    } finally {
      setProcessing(false);
      setShowCancelDialog(false);
    }
  };

  const handleMarkReady = async () => {
    if (!restaurantId) return;
    
    try {
      setProcessing(true);
      const orderNumber = orderId.startsWith('#') ? orderId : `#${orderId}`;
      await orderService.updateOrderStatus(restaurantId, orderNumber, 'ready', user?.username || 'pos_app');
      
      // Print delivery sticker
      await printerService.printDeliverySticker(order);
      
      toast.success('Order marked as ready!');
      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      console.error('Error marking ready:', error);
      toast.error('Failed to mark order as ready');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdatePrepTime = async () => {
    try {
      // await orderService.setPrepTime(orderId, prepTime);
      toast.success('Prep time updated');
    } catch (error) {
      toast.error('Failed to update prep time');
    }
  };

  const handlePrintKitchenReceipt = async () => {
    const result = await printerService.printKitchenReceipt(order);
    if (result.success) {
      toast.success('Kitchen receipt printed');
    } else {
      toast.error('Failed to print: ' + result.error);
    }
  };

  const handlePrintSticker = async () => {
    const result = await printerService.printDeliverySticker(order);
    if (result.success) {
      toast.success('Delivery sticker printed');
    } else {
      toast.error('Failed to print: ' + result.error);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }
    try {
      // await orderService.assignDriver(orderId, selectedDriver);
      const driver = drivers.find(d => d.id === selectedDriver);
      toast.success(`Order assigned to ${driver.name}`);
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const handleMarkPickedUp = async () => {
    try {
      // await orderService.updateOrderStatus(orderId, 'out_for_delivery');
      toast.success('Order marked as out for delivery');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '🟨', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', icon: '🟦', label: 'Accepted' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: '🟦', label: 'Accepted' }, // Database uses 'approved'
      preparing: { color: 'bg-indigo-100 text-indigo-800', icon: '👨‍🍳', label: 'Preparing' },
      ready: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Ready' },
      dispatched: { color: 'bg-purple-100 text-purple-800', icon: '🚚', label: 'Dispatched' },
      scheduled: { color: 'bg-purple-100 text-purple-800', icon: '🟣', label: 'Scheduled' },
      delivered: { color: 'bg-green-500 text-white', icon: '✓', label: 'Delivered' },
      completed: { color: 'bg-green-500 text-white', icon: '✓', label: 'Delivered' }, // Database uses 'completed'
      cancelled: { color: 'bg-red-500 text-white', icon: '✗', label: 'Cancelled' },
      refunded: { color: 'bg-gray-500 text-white', icon: '↺', label: 'Refunded' }
    };
    return statusConfig[order.status] || statusConfig.pending;
  };

  const calculateScheduledPrepStart = () => {
    if (!order.scheduledFor || !order.prepTime) return null;
    const scheduledTime = new Date(order.scheduledFor);
    const prepStartTime = new Date(scheduledTime.getTime() - order.prepTime * 60 * 1000);
    return prepStartTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 text-lg mb-4">Order not found</p>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const statusBadge = getStatusBadge();
  const prepStartTime = calculateScheduledPrepStart();

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="order-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/orders')}
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">{formatRelativeTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowReceiptPreview(true)}
            data-testid="preview-receipt-button"
          >
            <Printer className="w-4 h-4 mr-2" />
            Preview Receipt
          </Button>
          <Badge className={statusBadge.color} data-testid="order-status-badge">
            <span className="mr-1">{statusBadge.icon}</span>
            {statusBadge.label}
          </Badge>
        </div>
      </div>

      {/* Scheduled Order Banner */}
      {order.status === 'scheduled' && order.scheduledFor && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled for: {formatDateTime(order.scheduledFor)}
                </p>
                {prepStartTime && (
                  <Badge className="mt-2 bg-purple-600 text-white">
                    Prep should start at {formatDateTime(prepStartTime)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card data-testid="customer-info-card">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Customer Name (Restaurant Only)</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-2 border-t">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
              {order.specialInstructions && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                  <p className="text-sm text-gray-600 mt-1">{order.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card data-testid="order-items-card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Modifiers: {item.modifiers.join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-orange-600 mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card data-testid="order-summary-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-900">{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-900">{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions for PENDING Order */}
          {order.status === 'pending' && (
            <Card data-testid="order-actions-card">
              <CardHeader>
                <CardTitle>Accept Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prep-time">Preparation Time (minutes)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    min="5"
                    max="120"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value))}
                    data-testid="prep-time-input"
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptOrder}
                  disabled={processing}
                  data-testid="accept-order-button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Order ({prepTime} min)
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={processing}
                  data-testid="decline-order-button"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintKitchenReceipt}
                  data-testid="print-receipt-button"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Kitchen Receipt
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions for ACCEPTED Order */}
          {order.status === 'accepted' && (
            <Card data-testid="accepted-order-actions">
              <CardHeader>
                <CardTitle>Order in Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prep-time-edit">Change Prep Time (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="prep-time-edit"
                      type="number"
                      min="5"
                      max="120"
                      value={prepTime}
                      onChange={(e) => setPrepTime(parseInt(e.target.value))}
                      data-testid="prep-time-edit-input"
                    />
                    <Button onClick={handleUpdatePrepTime} size="sm">
                      Update
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleMarkReady}
                  disabled={processing}
                  data-testid="mark-ready-button"
                >
                  Mark as Ready
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintKitchenReceipt}
                  data-testid="print-kitchen-receipt-btn"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Kitchen Receipt
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintSticker}
                  data-testid="print-sticker-btn"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Print Sticker (Delivery Label)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions for READY Order */}
          {order.status === 'ready' && (
            <Card data-testid="ready-order-actions">
              <CardHeader>
                <CardTitle>Ready for Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="driver-select">Assign Driver</Label>
                  <div className="flex gap-2">
                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                      <SelectTrigger id="driver-select" data-testid="driver-select">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssignDriver} size="sm">
                      Assign
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleMarkPickedUp}
                  disabled={processing}
                  data-testid="out-for-delivery-button"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Out for Delivery
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintKitchenReceipt}
                  data-testid="print-receipt-ready"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Kitchen Receipt
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrintSticker}
                  data-testid="print-label-ready"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Print Sticker / Label
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Details for DELIVERED Order */}
          {order.status === 'delivered' && (
            <Card data-testid="delivered-order-details" className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">✓ Order Delivered</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Delivered Time:</span>
                    <span className="text-sm text-gray-900">{formatDateTime(order.deliveredAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Delivered By:</span>
                    <span className="text-sm text-gray-900">{order.deliveredBy || 'Restaurant Driver'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">OTP Verified:</span>
                    <Badge variant={order.otpVerified ? 'default' : 'secondary'} className={order.otpVerified ? 'bg-green-500' : ''}>
                      {order.otpVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  {order.deliveryNotes && (
                    <div className="py-2 border-b">
                      <p className="text-sm font-medium text-gray-600 mb-1">Delivery Notes:</p>
                      <p className="text-sm text-gray-900">{order.deliveryNotes}</p>
                    </div>
                  )}
                  
                  {order.customerRating && (
                    <div className="py-2 border-b">
                      <p className="text-sm font-medium text-gray-600 mb-1">Customer Rating:</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`text-lg ${star <= order.customerRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({order.customerRating}/5)</span>
                      </div>
                    </div>
                  )}
                  
                  {order.customerReview && (
                    <div className="py-2">
                      <p className="text-sm font-medium text-gray-600 mb-1">Customer Review:</p>
                      <p className="text-sm text-gray-700 italic">"{order.customerReview}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details for CANCELLED Order */}
          {order.status === 'cancelled' && (
            <Card data-testid="cancelled-order-details" className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">✗ Order Cancelled</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Cancelled At:</span>
                    <span className="text-sm text-gray-900">{formatDateTime(order.cancelledAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Who Cancelled:</span>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      {order.whoCancelled || 'Not specified'}
                    </Badge>
                  </div>
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-600 mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-gray-900">{order.cancellationReason || 'Not provided'}</p>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-800">
                    This order was cancelled and cannot be reactivated. Customer has been notified.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details for REFUNDED Order */}
          {order.status === 'refunded' && (
            <Card data-testid="refunded-order-details" className="border-gray-300">
              <CardHeader>
                <CardTitle className="text-gray-700">↺ Order Refunded</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Refunded At:</span>
                    <span className="text-sm text-gray-900">{formatDateTime(order.refundedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Refund Amount:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(order.refundAmount || order.total)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Refund Type:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800">
                      {order.refundType || 'Full refund'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-gray-600">Refund Method:</span>
                    <span className="text-sm text-gray-900">{order.refundMethod || 'Back to card'}</span>
                  </div>
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-600 mb-1">Refund Reason:</p>
                    <p className="text-sm text-gray-900">{order.refundReason || 'Not specified'}</p>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Processed By:</span>
                    <span className="text-sm text-gray-900">{order.refundProcessedBy || 'System Admin'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700">
                    This order has been refunded. The amount will be credited back to the customer within 5-7 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Preview Dialog */}
      <AlertDialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Receipt Preview</AlertDialogTitle>
            <AlertDialogDescription>
              Order #{order.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {/* Receipt Content matching the PDF format */}
            <div className="space-y-4 text-sm bg-white p-4 border rounded">
              {/* Logo and Store Info */}
              <div className="text-center border-b pb-4">
                <img src="/gbc-logo.png" alt="GBC Logo" className="h-16 mx-auto mb-2" />
                <p className="font-bold">{order.storeName || "General Bilimoria's Canteen"}</p>
                <p className="text-xs text-gray-600">{order.storeAddress || "Borehamwood, 18 Leeming Road"}</p>
              </div>

              {/* Order Details */}
              <div className="space-y-1 border-b pb-3">
                <div className="flex justify-between">
                  <span className="font-medium">Order</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-1 border-b pb-3">
                <p className="font-medium">Customer</p>
                <div className="pl-2 space-y-1 text-xs">
                  <p><span className="font-medium">Name:</span> {order.customerName}</p>
                  <p><span className="font-medium">Address:</span> {order.deliveryAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 border-b pb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="pl-4 text-xs text-gray-600">
                        {item.modifiers.map((mod, i) => (
                          <p key={i}>+ {mod}</p>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="pl-4 text-xs text-gray-600 italic">(note: {item.notes})</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="border-t pt-3 text-xs">
                  <p className="font-medium">Order note:</p>
                  <p className="text-gray-600">{order.specialInstructions}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-gray-600 border-t pt-3">
                <p>Thank you for Ordering</p>
                <p>See you again Online!</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                printerService.printCustomerReceipt(order);
                toast.success('Printing receipt...');
              }}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for declining this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              data-testid="cancel-reason-textarea"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-dialog-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeclineOrder}
              className="bg-red-600 hover:bg-red-700"
              data-testid="cancel-dialog-confirm"
            >
              Decline Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetailPage;