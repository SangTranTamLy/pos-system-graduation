-- Script kiểm tra cấu trúc bảng employees

-- 1. Kiểm tra tất cả các cột
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- 2. Kiểm tra dữ liệu nhân viên hiện tại
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
FROM employees
ORDER BY created_at;

-- 3. Kiểm tra indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'employees';

-- 4. Test tạo nhân viên mới (chỉ để test, sẽ rollback)
BEGIN;

INSERT INTO employees (employee_code, password_hash, full_name, role, is_active)
VALUES ('TEST001', '$2b$10$test', 'Test User', 'CASHIER', TRUE)
RETURNING *;

ROLLBACK; -- Không lưu, chỉ test

-- Kết quả mong đợi:
-- ✅ Cột is_active tồn tại với type BOOLEAN
-- ✅ Cột updated_at tồn tại với type TIMESTAMPTZ
-- ✅ Tất cả nhân viên hiện tại có is_active = TRUE
-- ✅ Index idx_employees_is_active tồn tại
-- ✅ Test INSERT thành công
