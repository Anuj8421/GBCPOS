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
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/helpers';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/utils/constants';
import { ArrowLeft, Clock, Phone, MapPin, Printer, Check, X, Truck, Tag } from 'lucide-react';
import { toast } from 'sonner';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepTime, setPrepTime] = useState(20);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');

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
    try {
      // Mock data - will be replaced with real API
      // Determine status based on order ID for testing
      let mockStatus = 'pending';
      let mockAcceptedAt = null;
      let mockReadyAt = null;
      let mockScheduledFor = null;
      
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
        // Schedule for 2 hours from now
        mockScheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
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
        prepTime: 20,
        specialInstructions: 'Please ring doorbell twice'
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
    try {
      setProcessing(true);
      // await orderService.acceptOrder(orderId, prepTime);
      
      // Print kitchen receipt automatically
      await printerService.printKitchenReceipt(order);
      
      toast.success(`Order accepted! Prep time: ${prepTime} min`);
      navigate('/orders');
    } catch (error) {
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

    try {
      setProcessing(true);
      // await orderService.cancelOrder(orderId, cancelReason);
      
      toast.success('Order declined');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to decline order');
    } finally {
      setProcessing(false);
      setShowCancelDialog(false);
    }
  };

  const handleMarkReady = async () => {
    try {
      setProcessing(true);
      // await orderService.markReady(orderId);
      
      // Print delivery sticker
      await printerService.printDeliverySticker(order);
      
      toast.success('Order marked as ready!');
      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
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
      ready: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Ready' },
      scheduled: { color: 'bg-purple-100 text-purple-800', icon: '🟣', label: 'Scheduled' }
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
            <h1 className="text-2xl font-bold text-gray-900">Order {order.id}</h1>
            <p className="text-gray-600 mt-1">{formatRelativeTime(order.createdAt)}</p>
          </div>
        </div>
        <Badge className={statusBadge.color} data-testid="order-status-badge">
          <span className="mr-1">{statusBadge.icon}</span>
          {statusBadge.label}
        </Badge>
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
        </div>
      </div>

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