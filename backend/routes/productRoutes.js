const express = require('express');
const router = express.Router();

const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, verifyRole('ADMIN'), createProduct);
router.patch('/:id', verifyToken, verifyRole('ADMIN'), updateProduct);
router.delete('/:id', verifyToken, verifyRole('ADMIN'), deleteProduct);

module.exports = router;
