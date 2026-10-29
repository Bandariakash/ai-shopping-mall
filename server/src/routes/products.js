const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getProductsByIds } = require('../controllers/productController');
const { validateQuery, productSearchSchema } = require('../middleware/validation');

router.get('/', validateQuery(productSearchSchema), getProducts);
router.get('/by-ids', getProductsByIds);
router.get('/:productId', getProductById);

module.exports = router;

