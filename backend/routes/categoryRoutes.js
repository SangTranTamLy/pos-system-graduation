const express = require('express');
const router = express.Router();

const { getCategories } = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getCategories);

module.exports = router;
