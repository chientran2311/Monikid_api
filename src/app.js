import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/unifiedConfig.js';
import { transactionRoutes } from './routes/transactionRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { AppError } from './utils/AppError.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'monikid-backend-api' });
});

app.use('/api/transactions', transactionRoutes);

// 404 Handler
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
