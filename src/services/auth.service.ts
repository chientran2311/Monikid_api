import crypto from 'crypto';
import { Errors } from '../utils/errors.js';

// =============================================================================
// TYPES
// =============================================================================

interface OtpRecord {
    phone: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
    attempts: number;
}

interface Session {
    token: string;
    phone: string;
    createdAt: Date;
    expiresAt: Date;
}

// =============================================================================
// IN-MEMORY STORES (for demo - use Redis in production)
// =============================================================================

const otpStore = new Map<string, OtpRecord>();
const sessionStore = new Map<string, Session>();

// =============================================================================
// SERVICE
// =============================================================================

class AuthService {
    private readonly OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS) || 300;
    private readonly OTP_LENGTH = Number(process.env.OTP_LENGTH) || 6;
    private readonly SESSION_EXPIRY_HOURS = 24;
    private readonly MAX_OTP_ATTEMPTS = 5;

    /**
     * Generate and store OTP for phone number
     * In demo mode: returns OTP in response (real: send via SMS)
     */
    sendOtp(phone: string): { requestId: string; expiresIn: number; demoOtp?: string } {
        // Normalize phone (remove +84, keep 0)
        const normalizedPhone = this.normalizePhone(phone);

        // Generate 6-digit OTP
        const otp = this.generateOtp();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.OTP_EXPIRY_SECONDS * 1000);

        // Store OTP
        otpStore.set(normalizedPhone, {
            phone: normalizedPhone,
            otp,
            createdAt: now,
            expiresAt,
            attempts: 0,
        });

        console.log(`📱 OTP sent to ${normalizedPhone}: ${otp}`);

        return {
            requestId: crypto.randomUUID(),
            expiresIn: this.OTP_EXPIRY_SECONDS,
            // Return OTP in demo mode (remove in production!)
            demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        };
    }

    /**
     * Verify OTP and create session
     */
    verifyOtp(phone: string, otp: string): { token: string; expiresAt: Date } {
        const normalizedPhone = this.normalizePhone(phone);
        const record = otpStore.get(normalizedPhone);

        if (!record) {
            throw Errors.OTP_NOT_FOUND();
        }

        // Check expiry
        if (new Date() > record.expiresAt) {
            otpStore.delete(normalizedPhone);
            throw Errors.OTP_EXPIRED();
        }

        // Check attempts
        record.attempts++;
        if (record.attempts > this.MAX_OTP_ATTEMPTS) {
            otpStore.delete(normalizedPhone);
            throw Errors.OTP_EXPIRED();
        }

        // Verify OTP
        if (record.otp !== otp) {
            throw Errors.OTP_INVALID();
        }

        // OTP verified - delete it and create session
        otpStore.delete(normalizedPhone);

        const session = this.createSession(normalizedPhone);
        return {
            token: session.token,
            expiresAt: session.expiresAt,
        };
    }

    /**
     * Get session by token (for middleware)
     */
    getSession(token: string): Session | null {
        const session = sessionStore.get(token);

        if (!session) return null;

        // Check expiry
        if (new Date() > session.expiresAt) {
            sessionStore.delete(token);
            return null;
        }

        return session;
    }

    /**
     * Logout - delete session
     */
    logout(token: string): boolean {
        return sessionStore.delete(token);
    }

    // ===========================================================================
    // PRIVATE METHODS
    // ===========================================================================

    private normalizePhone(phone: string): string {
        // Convert +84 to 0
        if (phone.startsWith('+84')) {
            return '0' + phone.slice(3);
        }
        return phone;
    }

    private generateOtp(): string {
        // Generate secure random digits
        const digits = '0123456789';
        let otp = '';
        const bytes = crypto.randomBytes(this.OTP_LENGTH);
        for (let i = 0; i < this.OTP_LENGTH; i++) {
            otp += digits[bytes[i] % 10];
        }
        return otp;
    }

    private createSession(phone: string): Session {
        const token = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

        const session: Session = {
            token,
            phone,
            createdAt: now,
            expiresAt,
        };

        sessionStore.set(token, session);
        console.log(`🔐 Session created for ${phone}`);

        return session;
    }
}

export const authService = new AuthService();
