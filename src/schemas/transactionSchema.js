import { z } from 'zod';

// Transaction types matching Flutter app: bank_deposit, bank_withdraw, allowance, payment, request_transfer
export const transactionTypes = ['bank_deposit', 'bank_withdraw', 'allowance', 'payment', 'request_transfer'];

export const createTransactionSchema = z.object({
    family_id: z.string().uuid(),
    from_wallet_id: z.string().uuid().optional(),
    to_wallet_id: z.string().uuid().optional(),
    type: z.enum(['bank_deposit', 'bank_withdraw', 'allowance', 'payment', 'request_transfer']),
    amount: z.number().positive(),
    description: z.string().optional(),
    merchant_name: z.string().optional(),
    location_lat: z.number().optional(),
    location_lng: z.number().optional(),
    created_by: z.string().uuid(),
    status: z.enum(['pending', 'completed', 'failed']).default('pending'),
});

export const getTransactionsSchema = z.object({
    wallet_id: z.string().uuid().optional(),
    family_id: z.string().uuid().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});
