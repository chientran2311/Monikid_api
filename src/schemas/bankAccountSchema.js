import { z } from 'zod';

/**
 * Bank Account validation schemas using Zod
 */

export const getBankAccountByIdSchema = z.object({
    id: z.string().uuid(),
});

export const getBankAccountsByUserSchema = z.object({
    user_id: z.string().uuid(),
});

export const createBankAccountSchema = z.object({
    user_id: z.string().uuid(),
    account_number: z.string().min(10).max(20).optional(),
    bank_name: z.string().min(2).max(100),
    balance: z.number().min(0).optional(),
});

export const transferToBankSchema = z.object({
    account_id: z.string().uuid(),
    amount: z.number().positive(),
});

export const verifyAccountSchema = z.object({
    id: z.string().uuid(),
});
