const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { employee_code, password } = req.body;

        // 1. Kiểm tra đầu vào (Validation)
        if (!employee_code || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã nhân viên và mật khẩu' });
        }

        // 2. Tìm nhân viên trong Supabase
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('employee_code', employee_code)
            .single(); // Lấy 1 dòng duy nhất

        if (error || !employee) {
            return res.status(401).json({ success: false, message: 'Mã nhân viên hoặc mật khẩu không đúng' });
        }

        // 3. So sánh mật khẩu bằng BCrypt
        const isMatch = await bcrypt.compare(password, employee.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mã nhân viên hoặc mật khẩu không đúng' });
        }

        // 4. Khởi tạo Payload và ký JWT Token
        const payload = {
            id: employee.id,
            employee_code: employee.employee_code,
            full_name: employee.full_name,
            role: employee.role
        };

        // Token hết hạn sau 8 tiếng (1 ca làm việc)
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // 5. Trả về kết quả (Tuyệt đối không trả về password_hash)
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token: token,
            user: payload
        });

    } catch (err) {
        console.error('Lỗi hệ thống (Login):', err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = { login };