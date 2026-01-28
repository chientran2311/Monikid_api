import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.routes.js';
import { bankRouter } from './routes/bank.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiKeyAuth } from './middleware/auth.middleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for demo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
app.use(express.json({ limit: '10kb' }));

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mockbank-api',
        version: '1.0.0',
    });
});

// API Routes (with API key auth)
app.use('/api/v1/auth', apiKeyAuth, authRouter);
app.use('/api/v1/bank', apiKeyAuth, bankRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🏦 Mock Bank API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Auth API: http://localhost:${PORT}/api/v1/auth`);
    console.log(`💰 Bank API: http://localhost:${PORT}/api/v1/bank`);
});

export default app;
