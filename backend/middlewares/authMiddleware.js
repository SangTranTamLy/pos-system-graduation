const jwt = require('jsonwebtoken');
require('dotenv').config();

// Chốt chặn 1: Kiểm tra xem người dùng có Token hợp lệ không
const verifyToken = (req, res, next) => {
    // Lấy token từ Header của Request (Định dạng: Bearer <token>)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Từ chối truy cập. Vui lòng cung cấp Token hợp lệ.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Giải mã Token bằng chữ ký bí mật trong file .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin nhân viên (đã giải mã) vào request để các API phía sau sử dụng
        req.user = decoded; 
        next(); // Cho phép đi qua chốt chặn
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token không hợp lệ hoặc đã hết hạn (Hết ca làm việc).' 
        });
    }
};

// Chốt chặn 2: Kiểm tra chức vụ (Role) của nhân viên
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Phải đặt sau verifyToken thì mới có req.user
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Truy cập bị cấm. Bạn không có quyền thực hiện hành động này.' 
            });
        }
        next(); // Đúng quyền thì cho qua
    };
};

module.exports = { verifyToken, verifyRole };