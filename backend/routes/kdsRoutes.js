const express = require('express');
const router = express.Router();

const { getKitchenOrders } = require('../controllers/kdsController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/orders', verifyToken, verifyRole('ADMIN'), getKitchenOrders);

module.exports = router;
