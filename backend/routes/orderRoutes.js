const express = require('express');
const router = express.Router();

const { createOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Tạo đơn hàng mới (CASHIER và ADMIN)
router.post('/', verifyToken, verifyRole('CASHIER', 'ADMIN'), createOrder);

// Lấy danh sách đơn hàng
router.get('/', verifyToken, getOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', verifyToken, getOrderById);

// Hủy đơn hàng (CASHIER và ADMIN)
router.put('/:id/cancel', verifyToken, verifyRole('CASHIER', 'ADMIN'), cancelOrder);

module.exports = router;
