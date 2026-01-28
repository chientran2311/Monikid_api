import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

/**
 * API Key authentication middleware
 * Validates X-API-Key header against configured API_KEY
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;
    const validKey = process.env.API_KEY || 'monikid-mockbank-secret-2024';

    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: {
                code: 'MISSING_API_KEY',
                message: 'X-API-Key header is required',
            },
        });
        return;
    }

    if (apiKey !== validKey) {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_API_KEY',
                message: 'Invalid API key',
            },
        });
        return;
    }

    next();
}

/**
 * Session token authentication middleware
 * Validates Bearer token from authenticated phone session
 */
export function sessionAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: {
                code: 'MISSING_TOKEN',
                message: 'Bearer token is required',
            },
        });
        return;
    }

    const token = authHeader.slice(7);

    // Import session store dynamically to avoid circular dependency
    import('../services/auth.service.js').then(({ authService }) => {
        const session = authService.getSession(token);

        if (!session) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Session expired or invalid',
                },
            });
            return;
        }

        // Attach session to request
        (req as any).session = session;
        next();
    });
}
