const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Route Đăng nhập
router.post('/login', login);

module.exports = router;