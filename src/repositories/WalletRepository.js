import { supabase } from '../config/supabaseClient.js';
import { AppError } from '../utils/AppError.js';

/**
 * WalletRepository - Data Access Layer for wallet operations
 * Following layered architecture: Routes → Controllers → Services → Repositories
 */
class WalletRepository {
    /**
     * Get wallet by ID
     * @param {string} walletId - UUID of the wallet
     * @returns {Promise<Object>} Wallet data
     */
    async getById(walletId) {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('id', walletId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new AppError('Wallet not found', 404);
            }
            throw new AppError(`Database error: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Get wallet by user ID
     * @param {string} userId - UUID of the user
     * @returns {Promise<Object>} Wallet data
     */
    async getByUserId(userId) {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new AppError('Wallet not found for this user', 404);
            }
            throw new AppError(`Database error: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Get all wallets for a family
     * @param {string} familyId - UUID of the family
     * @returns {Promise<Array>} Array of wallet data with user info
     */
    async getByFamilyId(familyId) {
        const { data, error } = await supabase
            .from('wallets')
            .select(`
                *,
                users!inner(id, display_name, role, avatar_url)
            `)
            .eq('family_id', familyId);

        if (error) {
            throw new AppError(`Database error: ${error.message}`, 500);
        }

        return data || [];
    }

    /**
     * Update wallet balance
     * @param {string} walletId - UUID of the wallet
     * @param {number} newBalance - New balance amount
     * @returns {Promise<Object>} Updated wallet data
     */
    async updateBalance(walletId, newBalance) {
        const { data, error } = await supabase
            .from('wallets')
            .update({ 
                balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', walletId)
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to update balance: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Create a new wallet
     * @param {Object} walletData - Wallet creation data
     * @returns {Promise<Object>} Created wallet
     */
    async create(walletData) {
        const { data, error } = await supabase
            .from('wallets')
            .insert({
                user_id: walletData.user_id,
                family_id: walletData.family_id,
                balance: walletData.balance || 0,
                currency: walletData.currency || 'VND',
                spending_limit: walletData.spending_limit || null,
            })
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to create wallet: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Update spending limit
     * @param {string} walletId - UUID of the wallet
     * @param {number} spendingLimit - New spending limit
     * @returns {Promise<Object>} Updated wallet
     */
    async updateSpendingLimit(walletId, spendingLimit) {
        const { data, error } = await supabase
            .from('wallets')
            .update({ 
                spending_limit: spendingLimit,
                updated_at: new Date().toISOString()
            })
            .eq('id', walletId)
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to update spending limit: ${error.message}`, 500);
        }

        return data;
    }
}

export default new WalletRepository();
