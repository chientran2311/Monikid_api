import { z } from 'zod';

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

/** Vietnamese phone number validation */
const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export const sendOtpSchema = z.object({
    phone: z.string()
        .regex(phoneRegex, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
});

export const verifyOtpSchema = z.object({
    phone: z.string()
        .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    otp: z.string()
        .length(6, 'Mã OTP phải có 6 chữ số')
        .regex(/^\d{6}$/, 'Mã OTP chỉ chứa số'),
});

// =============================================================================
// BANK SCHEMAS
// =============================================================================

export const createAccountSchema = z.object({
    phone: z.string()
        .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    fullName: z.string()
        .min(2, 'Họ tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ tên không được quá 100 ký tự'),
    initialBalance: z.number()
        .min(0, 'Số dư không được âm')
        .default(10000000), // 10 million VND default
});

export const depositSchema = z.object({
    accountNumber: z.string()
        .length(12, 'Số tài khoản phải có 12 chữ số'),
    amount: z.number()
        .positive('Số tiền phải lớn hơn 0')
        .max(1000000000, 'Số tiền tối đa 1 tỷ đồng'),
    description: z.string()
        .max(200)
        .optional(),
});

export const withdrawSchema = z.object({
    accountNumber: z.string()
        .length(12, 'Số tài khoản phải có 12 chữ số'),
    amount: z.number()
        .positive('Số tiền phải lớn hơn 0')
        .max(500000000, 'Số tiền rút tối đa 500 triệu'),
    description: z.string()
        .max(200)
        .optional(),
});

export const transferSchema = z.object({
    fromAccount: z.string()
        .length(12, 'Số tài khoản nguồn phải có 12 chữ số'),
    toWalletId: z.string()
        .uuid('ID ví không hợp lệ'),
    amount: z.number()
        .positive('Số tiền phải lớn hơn 0'),
    description: z.string()
        .max(200)
        .optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
