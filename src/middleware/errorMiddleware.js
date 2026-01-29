export const errorMiddleware = (err, req, res, next) => {
    console.error('Unhandled Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal server error' : message,
        }
    });
};
