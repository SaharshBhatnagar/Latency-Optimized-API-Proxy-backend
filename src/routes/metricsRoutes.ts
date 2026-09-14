import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getSystemMetrics } from '../controllers/metricsController.js';

const router = Router();

router.get('/', authenticate, getSystemMetrics);

export default router;