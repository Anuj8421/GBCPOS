import { Router, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const menuService = new MenuService();

router.get('/items', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await menuService.getMenuItems(req.restaurant!.id);
    res.json(items);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

router.post('/item', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await menuService.addMenuItem(req.restaurant!.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

router.put('/item/:itemId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const item = await menuService.updateMenuItem(
      req.restaurant!.id,
      parseInt(itemId),
      req.body
    );
    res.json(item);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

export default router;
