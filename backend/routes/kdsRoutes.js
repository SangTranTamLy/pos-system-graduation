const express = require('express');
const router = express.Router();

const { getKitchenOrders, updateItemStatus, getTodayStats } = require('../controllers/kdsController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Lấy danh sách đơn hàng bếp (cho ADMIN và KITCHEN)
router.get('/orders', verifyToken, verifyRole('ADMIN', 'KITCHEN'), getKitchenOrders);

// Cập nhật trạng thái món ăn
router.put('/items/:id/status', verifyToken, verifyRole('ADMIN', 'KITCHEN'), updateItemStatus);

// Lấy thống kê công việc hôm nay
router.get('/stats/today', verifyToken, verifyRole('ADMIN', 'KITCHEN'), getTodayStats);

module.exports = router;
