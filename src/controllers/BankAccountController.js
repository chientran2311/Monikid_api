import BankAccountService from '../services/BankAccountService.js';
import {
    getBankAccountByIdSchema,
    getBankAccountsByUserSchema,
    createBankAccountSchema,
    transferToBankSchema,
    verifyAccountSchema,
} from '../schemas/bankAccountSchema.js';

/**
 * BankAccountController - HTTP Request Handler for mock bank accounts
 */
class BankAccountController {
    /**
     * Get bank account by ID
     * GET /api/bank-accounts/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = getBankAccountByIdSchema.parse({ id: req.params.id });
            const account = await BankAccountService.getById(id);
            res.json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get bank accounts by user ID
     * GET /api/bank-accounts/user/:userId
     */
    async getByUserId(req, res, next) {
        try {
            const { user_id } = getBankAccountsByUserSchema.parse({ user_id: req.params.userId });
            const accounts = await BankAccountService.getByUserId(user_id);
            res.json({ success: true, data: accounts });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new bank account
     * POST /api/bank-accounts
     */
    async create(req, res, next) {
        try {
            const data = createBankAccountSchema.parse(req.body);
            const account = await BankAccountService.create(data);
            res.status(201).json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify a bank account
     * POST /api/bank-accounts/:id/verify
     */
    async verify(req, res, next) {
        try {
            const { id } = verifyAccountSchema.parse({ id: req.params.id });
            const account = await BankAccountService.verify(id);
            res.json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Transfer from bank to wallet (for deposit simulation)
     * POST /api/bank-accounts/transfer-to-wallet
     */
    async transferToWallet(req, res, next) {
        try {
            const data = transferToBankSchema.parse(req.body);
            const account = await BankAccountService.transferToWallet(data.account_id, data.amount);
            res.json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Receive from wallet to bank (for withdrawal simulation)
     * POST /api/bank-accounts/receive-from-wallet
     */
    async receiveFromWallet(req, res, next) {
        try {
            const data = transferToBankSchema.parse(req.body);
            const account = await BankAccountService.receiveFromWallet(data.account_id, data.amount);
            res.json({ success: true, data: account });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a bank account
     * DELETE /api/bank-accounts/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = getBankAccountByIdSchema.parse({ id: req.params.id });
            await BankAccountService.delete(id);
            res.json({ success: true, message: 'Bank account deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export default new BankAccountController();
