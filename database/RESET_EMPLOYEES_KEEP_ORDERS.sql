-- ============================================
-- RESET EMPLOYEES - GIỮ LẠI ORDERS
-- ============================================
-- Mục đích: Xóa nhân viên nhưng GIỮ LẠI dữ liệu orders
-- Orders sẽ vẫn có employee_code cũ (NV001, NV002, ...)
-- ============================================

-- Option 1: Set employee_code = NULL trong orders
-- (Yêu cầu: Foreign key phải có ON DELETE SET NULL)
UPDATE orders SET employee_code = NULL WHERE employee_code NOT LIKE 'ADMIN%';

-- Option 2: Chuyển tất cả orders về ADMIN01
-- (Nếu muốn giữ tracking)
UPDATE orders SET employee_code = 'ADMIN01' WHERE employee_code NOT LIKE 'ADMIN%';

-- Sau đó mới xóa nhân viên
DELETE FROM employees WHERE employee_code NOT LIKE 'ADMIN%';
DELETE FROM employees WHERE employee_code LIKE 'ADMIN%' AND employee_code != 'ADMIN01';

-- Đảm bảo ADMIN01 tồn tại
INSERT INTO employees (employee_code, password_hash, full_name, role, is_active)
SELECT 'ADMIN01', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Administrator', 'ADMIN', TRUE
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'ADMIN01');

-- Update ADMIN01
UPDATE employees 
SET password_hash = '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW',
    full_name = 'Administrator', role = 'ADMIN', is_active = TRUE, updated_at = NOW()
WHERE employee_code = 'ADMIN01';

-- Verify
SELECT employee_code, full_name, role FROM employees;
SELECT COUNT(*) as total_orders, employee_code FROM orders GROUP BY employee_code;

-- ============================================
-- KẾT QUẢ:
-- employees: Chỉ có ADMIN01
-- orders: Vẫn còn, nhưng employee_code = ADMIN01 hoặc NULL
-- ============================================
