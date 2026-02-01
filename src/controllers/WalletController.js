import WalletService from '../services/WalletService.js';
import {
    getWalletByIdSchema,
    getWalletByUserSchema,
    getFamilyWalletsSchema,
    createWalletSchema,
    depositSchema,
    withdrawSchema,
    transferSchema,
    allowanceSchema,
    paymentSchema,
    updateSpendingLimitSchema,
} from '../schemas/walletSchema.js';

/**
 * WalletController - HTTP Request Handler
 * Validates input using Zod schemas and delegates to WalletService
 */
class WalletController {
    /**
     * Get wallet by ID
     * GET /api/wallets/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = getWalletByIdSchema.parse({ id: req.params.id });
            const wallet = await WalletService.getById(id);
            res.json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get wallet by user ID
     * GET /api/wallets/user/:userId
     */
    async getByUserId(req, res, next) {
        try {
            const { user_id } = getWalletByUserSchema.parse({ user_id: req.params.userId });
            const wallet = await WalletService.getByUserId(user_id);
            res.json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all wallets in a family
     * GET /api/wallets/family/:familyId
     */
    async getFamilyWallets(req, res, next) {
        try {
            const { family_id } = getFamilyWalletsSchema.parse({ family_id: req.params.familyId });
            const wallets = await WalletService.getFamilyWallets(family_id);
            res.json({ success: true, data: wallets });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new wallet
     * POST /api/wallets
     */
    async create(req, res, next) {
        try {
            const data = createWalletSchema.parse(req.body);
            const wallet = await WalletService.createWallet(data);
            res.status(201).json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deposit money to wallet (from bank account)
     * POST /api/wallets/deposit
     */
    async deposit(req, res, next) {
        try {
            const data = depositSchema.parse(req.body);
            const result = await WalletService.deposit(data.wallet_id, data.amount, {
                family_id: data.family_id,
                created_by: data.created_by,
                description: data.description || 'Bank deposit',
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Withdraw money from wallet (to bank account)
     * POST /api/wallets/withdraw
     */
    async withdraw(req, res, next) {
        try {
            const data = withdrawSchema.parse(req.body);
            const result = await WalletService.withdraw(data.wallet_id, data.amount, {
                family_id: data.family_id,
                created_by: data.created_by,
                description: data.description || 'Bank withdrawal',
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Transfer money between wallets
     * POST /api/wallets/transfer
     */
    async transfer(req, res, next) {
        try {
            const data = transferSchema.parse(req.body);
            const result = await WalletService.transfer(
                data.from_wallet_id,
                data.to_wallet_id,
                data.amount,
                {
                    family_id: data.family_id,
                    created_by: data.created_by,
                    description: data.description || 'Wallet transfer',
                }
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Send allowance (parent to child)
     * POST /api/wallets/allowance
     */
    async sendAllowance(req, res, next) {
        try {
            const data = allowanceSchema.parse(req.body);
            const result = await WalletService.sendAllowance(
                data.from_wallet_id,
                data.to_wallet_id,
                data.amount,
                {
                    family_id: data.family_id,
                    created_by: data.created_by,
                    description: data.description || 'Allowance payment',
                }
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Make a payment (spending)
     * POST /api/wallets/payment
     */
    async makePayment(req, res, next) {
        try {
            const data = paymentSchema.parse(req.body);
            const result = await WalletService.makePayment(data.wallet_id, data.amount, {
                family_id: data.family_id,
                created_by: data.created_by,
                description: data.description,
                merchant_name: data.merchant_name,
                location_lat: data.location_lat,
                location_lng: data.location_lng,
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update spending limit
     * PATCH /api/wallets/:id/spending-limit
     */
    async updateSpendingLimit(req, res, next) {
        try {
            const data = updateSpendingLimitSchema.parse({
                wallet_id: req.params.id,
                spending_limit: req.body.spending_limit,
            });
            const wallet = await WalletService.updateSpendingLimit(data.wallet_id, data.spending_limit);
            res.json({ success: true, data: wallet });
        } catch (error) {
            next(error);
        }
    }
}

export default new WalletController();
