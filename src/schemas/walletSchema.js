import { z } from 'zod';

/**
 * Wallet validation schemas using Zod
 * Following best practices for input validation
 */

export const getWalletByIdSchema = z.object({
    id: z.string().uuid(),
});

export const getWalletByUserSchema = z.object({
    user_id: z.string().uuid(),
});

export const getFamilyWalletsSchema = z.object({
    family_id: z.string().uuid(),
});

export const createWalletSchema = z.object({
    user_id: z.string().uuid(),
    family_id: z.string().uuid(),
    balance: z.number().min(0).default(0),
    currency: z.string().length(3).default('VND'),
    spending_limit: z.number().positive().optional(),
});

export const depositSchema = z.object({
    wallet_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
    family_id: z.string().uuid(),
    created_by: z.string().uuid(),
});

export const withdrawSchema = z.object({
    wallet_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
    family_id: z.string().uuid(),
    created_by: z.string().uuid(),
});

export const transferSchema = z.object({
    from_wallet_id: z.string().uuid(),
    to_wallet_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
    family_id: z.string().uuid(),
    created_by: z.string().uuid(),
});

export const allowanceSchema = z.object({
    from_wallet_id: z.string().uuid(),
    to_wallet_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
    family_id: z.string().uuid(),
    created_by: z.string().uuid(),
});

export const paymentSchema = z.object({
    wallet_id: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().optional(),
    merchant_name: z.string().optional(),
    location_lat: z.number().optional(),
    location_lng: z.number().optional(),
    family_id: z.string().uuid(),
    created_by: z.string().uuid(),
});

export const updateSpendingLimitSchema = z.object({
    wallet_id: z.string().uuid(),
    spending_limit: z.number().positive(),
});
