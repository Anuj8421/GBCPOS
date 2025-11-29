import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await authService.login(username, password);

    if (!result) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message.includes('not active')) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

export default router;
