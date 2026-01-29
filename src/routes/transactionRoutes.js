import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const controller = new TransactionController();

// POST /api/transactions
router.post('/', controller.create);

// GET /api/transactions?wallet_id=...
router.get('/', controller.list);

// GET /api/transactions/:id
router.get('/:id', controller.getById);

export const transactionRoutes = router;
