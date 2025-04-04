const winston = require('winston');
const morgan = require('morgan');

// Winston Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Add console transport if not in production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// HTTP Request Logger Middleware
const httpLogger = morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
});

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(err.stack || err.message);

    // Determine error response based on environment
    const errorResponse = process.env.NODE_ENV === 'production'
        ? {
            status: 'error',
            message: 'An unexpected error occurred'
        }
        : {
            status: 'error',
            message: err.message,
            stack: err.stack
        };

    // Send error response
    res.status(err.status || 500).json(errorResponse);
};

module.exports = {
    logger,
    httpLogger,
    errorHandler
};