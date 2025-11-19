import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, Clock, Phone, MapPin, Printer, Check, X } from 'lucide-react';
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

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // const data = await orderService.getOrderById(orderId);
      // setOrder(data);

      // Mock data
      setOrder({
        id: orderId,
        customerName: 'John Smith',
        customerPhone: '(555) 123-4567',
        customerEmail: 'john.smith@email.com',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        status: 'pending',
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
        specialInstructions: 'Please ring doorbell twice',
        prepTime: null
      });
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
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to mark order as ready');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = async () => {
    const result = await printerService.printKitchenReceipt(order);
    if (result.success) {
      toast.success('Kitchen receipt printed');
    } else {
      toast.error('Failed to print: ' + result.error);
    }
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
        <Badge className={ORDER_STATUS_COLORS[order.status]} data-testid="order-status-badge">
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

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
                  <p className="font-medium text-gray-900">{order.customerName}</p>
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

          {/* Actions */}
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
                  onClick={handlePrintReceipt}
                  data-testid="print-receipt-button"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Kitchen Receipt
                </Button>
              </CardContent>
            </Card>
          )}

          {order.status === 'accepted' && (
            <Card data-testid="mark-ready-card">
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Prep time: {order.prepTime} minutes</span>
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
                  onClick={handlePrintReceipt}
                  data-testid="print-receipt-button"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Kitchen Receipt
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