const express = require('express');
const router = express.Router();

const { listEmployees, createEmployee, resetEmployeePassword } = require('../controllers/employeeController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, verifyRole('ADMIN'), listEmployees);
router.post('/', verifyToken, verifyRole('ADMIN'), createEmployee);
router.post('/:employeeCode/reset-password', verifyToken, verifyRole('ADMIN'), resetEmployeePassword);

module.exports = router;
