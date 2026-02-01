import { supabase } from '../config/supabaseClient.js';
import { AppError } from '../utils/AppError.js';

class TransactionRepository {
    async create(transactionData) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

        if (error) {
            throw new AppError(`DB Error: ${error.message}`, 500);
        }
        return data;
    }

    async find(filters = {}, { limit = 20, offset = 0 } = {}) {
        let query = supabase
            .from('transactions')
            .select('*', { count: 'exact' });

        if (filters.wallet_id) {
            // Logic: involve either from OR to
            query = query.or(`from_wallet_id.eq.${filters.wallet_id},to_wallet_id.eq.${filters.wallet_id}`);
        }

        if (filters.family_id) {
            query = query.eq('family_id', filters.family_id);
        }

        query = query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            throw new AppError(`DB Error: ${error.message}`, 500);
        }

        return { data, count };
    }

    async findById(id) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new AppError('Transaction not found', 404);
        }
        return data;
    }
}

export default new TransactionRepository();
