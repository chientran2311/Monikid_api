import { Router } from 'express';
import BankAccountController from '../controllers/BankAccountController.js';

const router = Router();

/**
 * Bank Account Routes
 * 
 * GET    /api/bank-accounts/:id              - Get bank account by ID
 * GET    /api/bank-accounts/user/:userId     - Get bank accounts by user ID
 * POST   /api/bank-accounts                  - Create new bank account
 * POST   /api/bank-accounts/:id/verify       - Verify bank account
 * POST   /api/bank-accounts/transfer-to-wallet   - Simulate bank to wallet transfer
 * POST   /api/bank-accounts/receive-from-wallet  - Simulate wallet to bank transfer
 * DELETE /api/bank-accounts/:id              - Delete bank account
 */

// Read operations
router.get('/user/:userId', BankAccountController.getByUserId.bind(BankAccountController));
router.get('/:id', BankAccountController.getById.bind(BankAccountController));

// Create bank account
router.post('/', BankAccountController.create.bind(BankAccountController));

// Bank operations
router.post('/:id/verify', BankAccountController.verify.bind(BankAccountController));
router.post('/transfer-to-wallet', BankAccountController.transferToWallet.bind(BankAccountController));
router.post('/receive-from-wallet', BankAccountController.receiveFromWallet.bind(BankAccountController));

// Delete
router.delete('/:id', BankAccountController.delete.bind(BankAccountController));

export default router;
