export class BaseController {
    handleSuccess(res, data, status = 200) {
        if (data === undefined || data === null) {
            return res.status(status).send();
        }
        return res.status(status).json({
            success: true,
            data,
        });
    }

    handleError(res, error) {
        console.error('Controller Error:', error);

        // Check if it's a known operational error with status code
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                error: {
                    code: error.code || 'ERROR',
                    message: error.message,
                },
            });
        }

        // Default to 500
        const message = error.message || 'Internal Server Error';
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
            },
        });
    }
}
