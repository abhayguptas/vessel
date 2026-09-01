import { Router } from 'express';
import { register, login, listApiKeys, generateApiKey } from './controllers.js';
import { requireAuth, requireRole } from './middlewares.js';

export const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', requireAuth, (req: any, res) => {
  res.json({ user: req.user });
});

router.get('/apikeys', requireAuth, listApiKeys);
router.post('/apikeys', requireAuth, generateApiKey);

// Admin only routes
router.get('/admin', requireAuth, requireRole(['owner', 'admin']), (req: any, res) => {
  res.json({ message: 'Welcome Admin' });
});
