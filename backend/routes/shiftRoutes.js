const express = require('express');
const router = express.Router();

const { getCurrentShift, openShift, closeShift, getShiftHistory, getAllShifts } = require('../controllers/shiftController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Admin: Xem tất cả báo cáo ca (ĐẶT TRƯỚC /current để tránh conflict)
router.get('/all', verifyToken, verifyRole('ADMIN'), getAllShifts);

// Lấy ca hiện tại
router.get('/current', verifyToken, verifyRole('CASHIER', 'ADMIN'), getCurrentShift);

// Lịch sử các ca (của nhân viên hiện tại)
router.get('/history', verifyToken, verifyRole('CASHIER', 'ADMIN'), getShiftHistory);

// Mở ca mới
router.post('/open', verifyToken, verifyRole('CASHIER', 'ADMIN'), openShift);

// Đóng ca
router.post('/close', verifyToken, verifyRole('CASHIER', 'ADMIN'), closeShift);

module.exports = router;
