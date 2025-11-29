import { Router, Response } from 'express';
import { OrderService } from '../services/order.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const orderService = new OrderService();

router.get('/list', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const orders = await orderService.getOrders(
      req.restaurant!.id,
      status as string
    );
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/detail/:orderNumber', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderDetail(
      req.restaurant!.id,
      orderNumber
    );

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

router.patch('/:orderNumber/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const { status, cancellationReason, prepTimeMinutes } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const order = await orderService.updateOrderStatus(
      req.restaurant!.id,
      orderNumber,
      status,
      cancellationReason,
      prepTimeMinutes
    );

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.patch('/:orderNumber/prep-time', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const { prepTimeMinutes } = req.body;

    if (prepTimeMinutes === undefined) {
      res.status(400).json({ error: 'Prep time is required' });
      return;
    }

    const order = await orderService.updatePrepTime(
      req.restaurant!.id,
      orderNumber,
      prepTimeMinutes
    );

    res.json(order);
  } catch (error) {
    console.error('Update prep time error:', error);
    res.status(500).json({ error: 'Failed to update prep time' });
  }
});

export default router;
