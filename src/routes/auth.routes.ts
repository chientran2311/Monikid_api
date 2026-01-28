import { Router } from 'express';
import { authService } from '../services/auth.service.js';
import { sendOtpSchema, verifyOtpSchema } from '../schemas/index.js';

const router = Router();

/**
 * POST /api/v1/auth/send-otp
 * Request OTP for phone number authentication
 */
router.post('/send-otp', async (req, res, next) => {
    try {
        const data = sendOtpSchema.parse(req.body);
        const result = authService.sendOtp(data.phone);

        res.json({
            success: true,
            data: {
                requestId: result.requestId,
                expiresIn: result.expiresIn,
                message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
                // Demo mode: include OTP in response
                ...(result.demoOtp && { demoOtp: result.demoOtp }),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and get session token
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const data = verifyOtpSchema.parse(req.body);
        const result = authService.verifyOtp(data.phone, data.otp);

        res.json({
            success: true,
            data: {
                token: result.token,
                expiresAt: result.expiresAt.toISOString(),
                message: 'Xác thực thành công',
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/auth/logout
 * Invalidate session token
 */
router.post('/logout', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            authService.logout(token);
        }

        res.json({
            success: true,
            data: {
                message: 'Đăng xuất thành công',
            },
        });
    } catch (error) {
        next(error);
    }
});

export { router as authRouter };
