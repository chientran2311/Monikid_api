import { Router } from 'express';
import { bankService } from '../services/bank.service.js';
import { sessionAuth } from '../middleware/auth.middleware.js';
import {
    createAccountSchema,
    depositSchema,
    withdrawSchema,
    transferSchema,
} from '../schemas/index.js';

const router = Router();

// All bank operations require authenticated session
router.use(sessionAuth);

/**
 * POST /api/v1/bank/accounts
 * Create new bank account
 */
router.post('/accounts', async (req, res, next) => {
    try {
        const data = createAccountSchema.parse(req.body);
        const account = bankService.createAccount(
            data.phone,
            data.fullName,
            data.initialBalance
        );

        res.status(201).json({
            success: true,
            data: {
                id: account.id,
                accountNumber: account.accountNumber,
                fullName: account.fullName,
                balance: account.balance,
                createdAt: account.createdAt.toISOString(),
                message: 'Tạo tài khoản thành công',
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/bank/accounts
 * Get accounts for authenticated phone
 */
router.get('/accounts', async (req, res, next) => {
    try {
        const session = (req as any).session;
        const accounts = bankService.getAccountsByPhone(session.phone);

        res.json({
            success: true,
            data: accounts.map(acc => ({
                id: acc.id,
                accountNumber: acc.accountNumber,
                fullName: acc.fullName,
                balance: acc.balance,
                isActive: acc.isActive,
                createdAt: acc.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/bank/accounts/:accountNumber
 * Get single account details
 */
router.get('/accounts/:accountNumber', async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const account = bankService.getAccount(accountNumber);

        if (!account) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'ACCOUNT_NOT_FOUND',
                    message: 'Không tìm thấy tài khoản',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: account.id,
                accountNumber: account.accountNumber,
                fullName: account.fullName,
                balance: account.balance,
                isActive: account.isActive,
                createdAt: account.createdAt.toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/bank/deposit
 * Deposit money to account (Nạp tiền)
 */
router.post('/deposit', async (req, res, next) => {
    try {
        const data = depositSchema.parse(req.body);
        const transaction = bankService.deposit(
            data.accountNumber,
            data.amount,
            data.description
        );

        const account = bankService.getAccount(data.accountNumber)!;

        res.json({
            success: true,
            data: {
                transactionId: transaction.id,
                accountNumber: transaction.accountNumber,
                amount: transaction.amount,
                balanceAfter: transaction.balanceAfter,
                type: 'DEPOSIT',
                description: transaction.description,
                createdAt: transaction.createdAt.toISOString(),
                message: `Nạp ${transaction.amount.toLocaleString('vi-VN')}đ thành công`,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/bank/withdraw
 * Withdraw money from account (Rút tiền)
 */
router.post('/withdraw', async (req, res, next) => {
    try {
        const data = withdrawSchema.parse(req.body);
        const transaction = bankService.withdraw(
            data.accountNumber,
            data.amount,
            data.description
        );

        res.json({
            success: true,
            data: {
                transactionId: transaction.id,
                accountNumber: transaction.accountNumber,
                amount: transaction.amount,
                balanceAfter: transaction.balanceAfter,
                type: 'WITHDRAW',
                description: transaction.description,
                createdAt: transaction.createdAt.toISOString(),
                message: `Rút ${transaction.amount.toLocaleString('vi-VN')}đ thành công`,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/bank/transfer-to-wallet
 * Transfer to MoniKid wallet (Nạp vào ví MoniKid)
 */
router.post('/transfer-to-wallet', async (req, res, next) => {
    try {
        const data = transferSchema.parse(req.body);
        const transaction = bankService.transferToWallet(
            data.fromAccount,
            data.toWalletId,
            data.amount,
            data.description
        );

        res.json({
            success: true,
            data: {
                transactionId: transaction.id,
                accountNumber: transaction.accountNumber,
                walletId: data.toWalletId,
                amount: transaction.amount,
                balanceAfter: transaction.balanceAfter,
                type: 'TRANSFER_TO_WALLET',
                description: transaction.description,
                createdAt: transaction.createdAt.toISOString(),
                message: `Chuyển ${transaction.amount.toLocaleString('vi-VN')}đ thành công`,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/bank/receive-from-wallet
 * Receive from MoniKid wallet (Rút từ ví về ngân hàng)
 */
router.post('/receive-from-wallet', async (req, res, next) => {
    try {
        const data = transferSchema.parse({
            ...req.body,
            fromAccount: req.body.toAccount, // Swap for receiving
            toWalletId: req.body.fromWalletId,
        });

        const transaction = bankService.receiveFromWallet(
            data.fromAccount,
            data.toWalletId,
            data.amount,
            data.description
        );

        res.json({
            success: true,
            data: {
                transactionId: transaction.id,
                accountNumber: transaction.accountNumber,
                walletId: data.toWalletId,
                amount: transaction.amount,
                balanceAfter: transaction.balanceAfter,
                type: 'TRANSFER_FROM_WALLET',
                description: transaction.description,
                createdAt: transaction.createdAt.toISOString(),
                message: `Nhận ${transaction.amount.toLocaleString('vi-VN')}đ thành công`,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/bank/transactions/:accountNumber
 * Get transaction history
 */
router.get('/transactions/:accountNumber', async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const transactions = bankService.getTransactions(accountNumber, limit);

        res.json({
            success: true,
            data: transactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                balanceBefore: tx.balanceBefore,
                balanceAfter: tx.balanceAfter,
                description: tx.description,
                reference: tx.reference,
                createdAt: tx.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        next(error);
    }
});

export { router as bankRouter };
