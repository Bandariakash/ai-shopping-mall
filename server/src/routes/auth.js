const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, getMe);

module.exports = router;

