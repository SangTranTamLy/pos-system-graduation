const express = require('express');
const router = express.Router();

const { listEmployees, createEmployee, resetEmployeePassword, deleteEmployee } = require('../controllers/employeeController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, verifyRole('ADMIN'), listEmployees);
router.post('/', verifyToken, verifyRole('ADMIN'), createEmployee);
router.post('/:employeeCode/reset-password', verifyToken, verifyRole('ADMIN'), resetEmployeePassword);
router.delete('/:employeeCode', verifyToken, verifyRole('ADMIN'), deleteEmployee);

module.exports = router;
