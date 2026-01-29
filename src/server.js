import app from './app.js';
import { config } from './config/unifiedConfig.js';

const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
