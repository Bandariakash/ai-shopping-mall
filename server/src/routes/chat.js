const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { handleChat, getChatHistory } = require('../controllers/chatController');
const { validate, chatSchema } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');

// Rate limiting: max 10 requests per minute per IP
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many requests',
    message: 'You\'re sending messages too quickly. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', chatRateLimit, optionalAuth, validate(chatSchema), handleChat);
router.get('/history', optionalAuth, getChatHistory);

module.exports = router;

