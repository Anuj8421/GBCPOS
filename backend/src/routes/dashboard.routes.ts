import { Router, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const dashboardService = new DashboardService();

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await dashboardService.getStats(
      req.restaurant!.id,
      startDate as string,
      endDate as string
    );
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/top-dishes', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dishes = await dashboardService.getTopDishes(req.restaurant!.id);
    res.json(dishes);
  } catch (error) {
    console.error('Get top dishes error:', error);
    res.status(500).json({ error: 'Failed to fetch top dishes' });
  }
});

router.get('/frequent-customers', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await dashboardService.getFrequentCustomers(req.restaurant!.id);
    res.json(customers);
  } catch (error) {
    console.error('Get frequent customers error:', error);
    res.status(500).json({ error: 'Failed to fetch frequent customers' });
  }
});

export default router;
