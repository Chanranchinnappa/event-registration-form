const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window
    message: {
        error: 'Too many registration attempts',
        message: 'Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the registration limit. Please try again in 15 minutes.'
        });
    }
});

module.exports = { registrationLimiter };
