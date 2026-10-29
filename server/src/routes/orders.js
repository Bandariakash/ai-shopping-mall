const express = require('express');
const router = express.Router();
const { processCheckout, getOrders, getOrderById } = require('../controllers/orderController');
const { validate, checkoutSchema } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');

router.post('/checkout', optionalAuth, validate(checkoutSchema), processCheckout);
router.get('/', optionalAuth, getOrders);
router.get('/:orderId', optionalAuth, getOrderById);

module.exports = router;

