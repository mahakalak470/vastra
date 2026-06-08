const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many requests. Please wait a minute.' }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests. Please slow down.' }
});

module.exports = { aiLimiter, apiLimiter };
