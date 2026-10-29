const express = require('express');
const router = express.Router();
const { getStores, getStoreById } = require('../controllers/storeController');

router.get('/', getStores);
router.get('/:storeId', getStoreById);

module.exports = router;

