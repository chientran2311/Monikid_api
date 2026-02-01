import BankAccountRepository from '../repositories/BankAccountRepository.js';
import { AppError } from '../utils/AppError.js';

/**
 * BankAccountService - Business Logic Layer for mock bank accounts
 * Simulates bank operations for the wallet feature
 */
class BankAccountService {
    /**
     * Get bank account by ID
     * @param {string} accountId - UUID of the bank account
     * @returns {Promise<Object>} Bank account data
     */
    async getById(accountId) {
        return BankAccountRepository.getById(accountId);
    }

    /**
     * Get all bank accounts for a user
     * @param {string} userId - UUID of the user
     * @returns {Promise<Array>} Array of bank accounts
     */
    async getByUserId(userId) {
        return BankAccountRepository.getByUserId(userId);
    }

    /**
     * Create a new mock bank account
     * @param {Object} accountData - Bank account creation data
     * @returns {Promise<Object>} Created bank account
     */
    async create(accountData) {
        // Generate mock account number if not provided
        if (!accountData.account_number) {
            accountData.account_number = this.generateAccountNumber();
        }

        return BankAccountRepository.create(accountData);
    }

    /**
     * Simulate transfer from bank to wallet (deposit)
     * This deducts from mock bank balance
     * @param {string} accountId - Bank account ID
     * @param {number} amount - Amount to transfer
     * @returns {Promise<Object>} Updated bank account
     */
    async transferToWallet(accountId, amount) {
        const account = await BankAccountRepository.getById(accountId);

        // Check if account is verified
        if (!account.is_verified) {
            throw new AppError('Bank account not verified', 400);
        }

        // Check sufficient balance
        if (parseFloat(account.balance) < parseFloat(amount)) {
            throw new AppError('Insufficient bank balance', 400);
        }

        // Deduct from bank account
        const newBalance = parseFloat(account.balance) - parseFloat(amount);
        return BankAccountRepository.updateBalance(accountId, newBalance);
    }

    /**
     * Simulate transfer from wallet to bank (withdrawal)
     * This adds to mock bank balance
     * @param {string} accountId - Bank account ID
     * @param {number} amount - Amount to transfer
     * @returns {Promise<Object>} Updated bank account
     */
    async receiveFromWallet(accountId, amount) {
        const account = await BankAccountRepository.getById(accountId);

        // Check if account is verified
        if (!account.is_verified) {
            throw new AppError('Bank account not verified', 400);
        }

        // Add to bank account
        const newBalance = parseFloat(account.balance) + parseFloat(amount);
        return BankAccountRepository.updateBalance(accountId, newBalance);
    }

    /**
     * Verify a bank account (mock verification)
     * @param {string} accountId - Bank account ID
     * @returns {Promise<Object>} Verified bank account
     */
    async verify(accountId) {
        return BankAccountRepository.verify(accountId);
    }

    /**
     * Delete a bank account
     * @param {string} accountId - Bank account ID
     * @returns {Promise<void>}
     */
    async delete(accountId) {
        return BankAccountRepository.delete(accountId);
    }

    /**
     * Generate a mock bank account number
     * @returns {string} Mock account number
     */
    generateAccountNumber() {
        const prefix = '9704'; // Vietnamese bank card prefix
        const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        return prefix + random;
    }
}

export default new BankAccountService();
