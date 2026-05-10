require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const kdsRoutes = require('./routes/kdsRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kds', kdsRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Server đã hoạt động !' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    console.log(`✅ Thời gian hệ thống: ${new Date().toLocaleString('vi-VN')}`);
}); 
