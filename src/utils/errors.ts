/**
 * Custom application error class
 * Use for all business logic errors
 */
export class AppError extends Error {
    constructor(
        public readonly code: string,
        public readonly message: string,
        public readonly statusCode: number = 400
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Pre-defined error factories
export const Errors = {
    // Auth errors
    INVALID_PHONE: () => new AppError('INVALID_PHONE', 'Số điện thoại không hợp lệ', 400),
    OTP_EXPIRED: () => new AppError('OTP_EXPIRED', 'Mã OTP đã hết hạn', 400),
    OTP_INVALID: () => new AppError('OTP_INVALID', 'Mã OTP không đúng', 400),
    OTP_NOT_FOUND: () => new AppError('OTP_NOT_FOUND', 'Chưa yêu cầu OTP cho số này', 400),
    SESSION_EXPIRED: () => new AppError('SESSION_EXPIRED', 'Phiên đăng nhập đã hết hạn', 401),

    // Bank errors
    ACCOUNT_NOT_FOUND: () => new AppError('ACCOUNT_NOT_FOUND', 'Không tìm thấy tài khoản', 404),
    INSUFFICIENT_BALANCE: () => new AppError('INSUFFICIENT_BALANCE', 'Số dư không đủ', 400),
    INVALID_AMOUNT: () => new AppError('INVALID_AMOUNT', 'Số tiền không hợp lệ', 400),
    TRANSACTION_FAILED: () => new AppError('TRANSACTION_FAILED', 'Giao dịch thất bại', 500),

    // General errors
    NOT_FOUND: (resource: string) => new AppError('NOT_FOUND', `${resource} không tồn tại`, 404),
    VALIDATION: (message: string) => new AppError('VALIDATION_ERROR', message, 400),
} as const;
