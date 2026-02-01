import { supabase } from '../config/supabaseClient.js';
import { AppError } from '../utils/AppError.js';

/**
 * BankAccountRepository - Data Access Layer for mock bank accounts
 */
class BankAccountRepository {
    /**
     * Get bank account by ID
     * @param {string} accountId - UUID of the bank account
     * @returns {Promise<Object>} Bank account data
     */
    async getById(accountId) {
        const { data, error } = await supabase
            .from('mock_bank_accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new AppError('Bank account not found', 404);
            }
            throw new AppError(`Database error: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Get bank accounts by user ID
     * @param {string} userId - UUID of the user
     * @returns {Promise<Array>} Array of bank accounts
     */
    async getByUserId(userId) {
        const { data, error } = await supabase
            .from('mock_bank_accounts')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            throw new AppError(`Database error: ${error.message}`, 500);
        }

        return data || [];
    }

    /**
     * Create a new bank account
     * @param {Object} accountData - Bank account creation data
     * @returns {Promise<Object>} Created bank account
     */
    async create(accountData) {
        const { data, error } = await supabase
            .from('mock_bank_accounts')
            .insert({
                user_id: accountData.user_id,
                account_number: accountData.account_number,
                bank_name: accountData.bank_name,
                balance: accountData.balance || 1000000, // Default mock balance
                is_verified: accountData.is_verified || false,
            })
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to create bank account: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Update bank account balance
     * @param {string} accountId - UUID of the bank account
     * @param {number} newBalance - New balance amount
     * @returns {Promise<Object>} Updated bank account
     */
    async updateBalance(accountId, newBalance) {
        const { data, error } = await supabase
            .from('mock_bank_accounts')
            .update({ 
                balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', accountId)
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to update balance: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Verify bank account
     * @param {string} accountId - UUID of the bank account
     * @returns {Promise<Object>} Updated bank account
     */
    async verify(accountId) {
        const { data, error } = await supabase
            .from('mock_bank_accounts')
            .update({ 
                is_verified: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', accountId)
            .select()
            .single();

        if (error) {
            throw new AppError(`Failed to verify account: ${error.message}`, 500);
        }

        return data;
    }

    /**
     * Delete bank account
     * @param {string} accountId - UUID of the bank account
     * @returns {Promise<void>}
     */
    async delete(accountId) {
        const { error } = await supabase
            .from('mock_bank_accounts')
            .delete()
            .eq('id', accountId);

        if (error) {
            throw new AppError(`Failed to delete account: ${error.message}`, 500);
        }
    }
}

export default new BankAccountRepository();
