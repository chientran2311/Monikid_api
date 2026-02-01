import { Router } from 'express';
import WalletController from '../controllers/WalletController.js';

const router = Router();

/**
 * Wallet Routes
 * 
 * GET    /api/wallets/:id              - Get wallet by ID
 * GET    /api/wallets/user/:userId     - Get wallet by user ID
 * GET    /api/wallets/family/:familyId - Get all family wallets
 * POST   /api/wallets                  - Create new wallet
 * POST   /api/wallets/deposit          - Deposit money from bank
 * POST   /api/wallets/withdraw         - Withdraw money to bank
 * POST   /api/wallets/transfer         - Transfer between wallets
 * POST   /api/wallets/allowance        - Send allowance (parent to child)
 * POST   /api/wallets/payment          - Make a payment
 * PATCH  /api/wallets/:id/spending-limit - Update spending limit
 */

// Read operations
router.get('/user/:userId', WalletController.getByUserId.bind(WalletController));
router.get('/family/:familyId', WalletController.getFamilyWallets.bind(WalletController));
router.get('/:id', WalletController.getById.bind(WalletController));

// Create wallet
router.post('/', WalletController.create.bind(WalletController));

// Wallet operations
router.post('/deposit', WalletController.deposit.bind(WalletController));
router.post('/withdraw', WalletController.withdraw.bind(WalletController));
router.post('/transfer', WalletController.transfer.bind(WalletController));
router.post('/allowance', WalletController.sendAllowance.bind(WalletController));
router.post('/payment', WalletController.makePayment.bind(WalletController));

// Update spending limit
router.patch('/:id/spending-limit', WalletController.updateSpendingLimit.bind(WalletController));

export default router;
