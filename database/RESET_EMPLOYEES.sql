-- ============================================
-- RESET DATABASE - Chỉ giữ lại 1 tài khoản ADMIN
-- ============================================
-- Mục đích: Xóa tất cả nhân viên test, chỉ giữ ADMIN
-- Admin sẽ tự tạo tài khoản cho nhân viên qua giao diện
-- ============================================

-- Bước 1: XÓA TẤT CẢ ĐỚN HÀNG (nếu muốn giữ lại, bỏ qua bước này)
-- CẢNH BÁO: Điều này sẽ xóa tất cả dữ liệu orders và order_items
DELETE FROM order_items;
DELETE FROM orders;

-- Bước 2: Xóa tất cả nhân viên (trừ ADMIN)
DELETE FROM employees 
WHERE employee_code NOT LIKE 'ADMIN%';

-- Bước 3: Xóa tất cả tài khoản ADMIN cũ (nếu có nhiều)
DELETE FROM employees 
WHERE employee_code LIKE 'ADMIN%' AND employee_code != 'ADMIN01';

-- Bước 4: Đảm bảo chỉ có 1 tài khoản ADMIN01
-- Nếu chưa có, tạo mới
INSERT INTO employees (employee_code, password_hash, full_name, role, is_active)
SELECT 'ADMIN01', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Administrator', 'ADMIN', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE employee_code = 'ADMIN01'
);

-- Bước 5: Update thông tin ADMIN01 (nếu đã tồn tại)
UPDATE employees 
SET 
    password_hash = '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW',
    full_name = 'Administrator',
    role = 'ADMIN',
    is_active = TRUE,
    updated_at = NOW()
WHERE employee_code = 'ADMIN01';

-- Bước 6: Verify kết quả
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    created_at
FROM employees
ORDER BY created_at;

-- Bước 7: Kiểm tra orders đã bị xóa
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;

-- ============================================
-- KẾT QUẢ MONG ĐỢI:
-- employees: Chỉ có 1 dòng (ADMIN01)
-- orders: 0 rows
-- order_items: 0 rows
-- ============================================

-- Thông tin đăng nhập:
-- Mã NV: ADMIN01
-- Mật khẩu: 123456
-- ============================================
