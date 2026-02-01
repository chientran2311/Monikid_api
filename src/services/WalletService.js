import WalletRepository from '../repositories/WalletRepository.js';
import TransactionRepository from '../repositories/TransactionRepository.js';
import { AppError } from '../utils/AppError.js';

/**
 * WalletService - Business Logic Layer for wallet operations
 * Handles balance validation, transaction processing, and wallet management
 */
class WalletService {
    /**
     * Get wallet by ID
     * @param {string} walletId - UUID of the wallet
     * @returns {Promise<Object>} Wallet data
     */
    async getById(walletId) {
        return WalletRepository.getById(walletId);
    }

    /**
     * Get wallet by user ID
     * @param {string} userId - UUID of the user
     * @returns {Promise<Object>} Wallet data
     */
    async getByUserId(userId) {
        return WalletRepository.getByUserId(userId);
    }

    /**
     * Get all family member wallets
     * @param {string} familyId - UUID of the family
     * @returns {Promise<Array>} Array of wallet data
     */
    async getFamilyWallets(familyId) {
        return WalletRepository.getByFamilyId(familyId);
    }

    /**
     * Process a deposit to wallet
     * @param {string} walletId - Target wallet ID
     * @param {number} amount - Amount to deposit
     * @param {Object} transactionData - Additional transaction data
     * @returns {Promise<Object>} Updated wallet and transaction
     */
    async deposit(walletId, amount, transactionData) {
        // Get current wallet
        const wallet = await WalletRepository.getById(walletId);
        
        // Calculate new balance
        const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
        
        // Update wallet balance
        const updatedWallet = await WalletRepository.updateBalance(walletId, newBalance);
        
        // Create transaction record
        const transaction = await TransactionRepository.create({
            ...transactionData,
            to_wallet_id: walletId,
            type: 'bank_deposit',
            amount: amount,
            status: 'completed',
        });

        return { wallet: updatedWallet, transaction };
    }

    /**
     * Process a withdrawal from wallet
     * @param {string} walletId - Source wallet ID
     * @param {number} amount - Amount to withdraw
     * @param {Object} transactionData - Additional transaction data
     * @returns {Promise<Object>} Updated wallet and transaction
     */
    async withdraw(walletId, amount, transactionData) {
        // Get current wallet
        const wallet = await WalletRepository.getById(walletId);
        
        // Validate sufficient balance
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
            throw new AppError('Insufficient balance for withdrawal', 400);
        }
        
        // Calculate new balance
        const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        
        // Update wallet balance
        const updatedWallet = await WalletRepository.updateBalance(walletId, newBalance);
        
        // Create transaction record
        const transaction = await TransactionRepository.create({
            ...transactionData,
            from_wallet_id: walletId,
            type: 'bank_withdraw',
            amount: amount,
            status: 'completed',
        });

        return { wallet: updatedWallet, transaction };
    }

    /**
     * Process a transfer between wallets
     * @param {string} fromWalletId - Source wallet ID
     * @param {string} toWalletId - Target wallet ID
     * @param {number} amount - Amount to transfer
     * @param {Object} transactionData - Additional transaction data
     * @returns {Promise<Object>} Updated wallets and transaction
     */
    async transfer(fromWalletId, toWalletId, amount, transactionData) {
        // Get source wallet
        const fromWallet = await WalletRepository.getById(fromWalletId);
        
        // Validate sufficient balance
        if (parseFloat(fromWallet.balance) < parseFloat(amount)) {
            throw new AppError('Insufficient balance for transfer', 400);
        }

        // Check spending limit for child wallets
        if (fromWallet.spending_limit && parseFloat(amount) > parseFloat(fromWallet.spending_limit)) {
            throw new AppError('Transfer amount exceeds spending limit', 400);
        }

        // Get target wallet (will throw if not found)
        await WalletRepository.getById(toWalletId);
        
        // Deduct from source wallet
        const newFromBalance = parseFloat(fromWallet.balance) - parseFloat(amount);
        const updatedFromWallet = await WalletRepository.updateBalance(fromWalletId, newFromBalance);
        
        // Add to target wallet
        const toWallet = await WalletRepository.getById(toWalletId);
        const newToBalance = parseFloat(toWallet.balance) + parseFloat(amount);
        const updatedToWallet = await WalletRepository.updateBalance(toWalletId, newToBalance);
        
        // Create transaction record
        const transaction = await TransactionRepository.create({
            ...transactionData,
            from_wallet_id: fromWalletId,
            to_wallet_id: toWalletId,
            type: 'request_transfer',
            amount: amount,
            status: 'completed',
        });

        return { 
            fromWallet: updatedFromWallet, 
            toWallet: updatedToWallet, 
            transaction 
        };
    }

    /**
     * Process an allowance payment (parent to child)
     * @param {string} fromWalletId - Parent wallet ID
     * @param {string} toWalletId - Child wallet ID
     * @param {number} amount - Allowance amount
     * @param {Object} transactionData - Additional transaction data
     * @returns {Promise<Object>} Updated wallets and transaction
     */
    async sendAllowance(fromWalletId, toWalletId, amount, transactionData) {
        // Get parent wallet
        const parentWallet = await WalletRepository.getById(fromWalletId);
        
        // Validate sufficient balance
        if (parseFloat(parentWallet.balance) < parseFloat(amount)) {
            throw new AppError('Insufficient balance for allowance', 400);
        }
        
        // Deduct from parent wallet
        const newParentBalance = parseFloat(parentWallet.balance) - parseFloat(amount);
        const updatedParentWallet = await WalletRepository.updateBalance(fromWalletId, newParentBalance);
        
        // Add to child wallet
        const childWallet = await WalletRepository.getById(toWalletId);
        const newChildBalance = parseFloat(childWallet.balance) + parseFloat(amount);
        const updatedChildWallet = await WalletRepository.updateBalance(toWalletId, newChildBalance);
        
        // Create transaction record
        const transaction = await TransactionRepository.create({
            ...transactionData,
            from_wallet_id: fromWalletId,
            to_wallet_id: toWalletId,
            type: 'allowance',
            amount: amount,
            status: 'completed',
        });

        return { 
            fromWallet: updatedParentWallet, 
            toWallet: updatedChildWallet, 
            transaction 
        };
    }

    /**
     * Process a payment (spending money)
     * @param {string} walletId - Wallet ID making payment
     * @param {number} amount - Payment amount
     * @param {Object} transactionData - Additional transaction data (merchant, location, etc.)
     * @returns {Promise<Object>} Updated wallet and transaction
     */
    async makePayment(walletId, amount, transactionData) {
        // Get wallet
        const wallet = await WalletRepository.getById(walletId);
        
        // Validate sufficient balance
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
            throw new AppError('Insufficient balance for payment', 400);
        }

        // Check spending limit
        if (wallet.spending_limit && parseFloat(amount) > parseFloat(wallet.spending_limit)) {
            throw new AppError('Payment amount exceeds spending limit', 400);
        }
        
        // Deduct from wallet
        const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        const updatedWallet = await WalletRepository.updateBalance(walletId, newBalance);
        
        // Create transaction record
        const transaction = await TransactionRepository.create({
            ...transactionData,
            from_wallet_id: walletId,
            type: 'payment',
            amount: amount,
            status: 'completed',
        });

        return { wallet: updatedWallet, transaction };
    }

    /**
     * Update spending limit for a wallet
     * @param {string} walletId - Wallet ID
     * @param {number} limit - New spending limit
     * @returns {Promise<Object>} Updated wallet
     */
    async updateSpendingLimit(walletId, limit) {
        return WalletRepository.updateSpendingLimit(walletId, limit);
    }

    /**
     * Create a new wallet for user
     * @param {Object} walletData - Wallet creation data
     * @returns {Promise<Object>} Created wallet
     */
    async createWallet(walletData) {
        return WalletRepository.create(walletData);
    }
}

export default new WalletService();
