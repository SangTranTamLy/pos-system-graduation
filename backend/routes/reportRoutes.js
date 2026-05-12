const express = require('express');
const router = express.Router();

const { getDashboardSummary, getSalesReports, getShiftDetailReport } = require('../controllers/reportController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/summary', verifyToken, verifyRole('ADMIN'), getDashboardSummary);
router.get('/sales', verifyToken, verifyRole('ADMIN'), getSalesReports);
router.get('/shift-detail', verifyToken, verifyRole('ADMIN'), getShiftDetailReport);

module.exports = router;
