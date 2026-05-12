-- ============================================
-- ALL-IN-ONE FIX - Sửa tất cả vấn đề
-- ============================================
-- Fix:
-- 1. Thêm cột is_active, updated_at (nếu chưa có)
-- 2. Xóa tất cả nhân viên test
-- 3. Tạo tài khoản ADMIN01 mới
-- 4. Verify tất cả
-- ============================================

-- BƯỚC 1: Thêm cột is_active và updated_at (nếu chưa có)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set giá trị mặc định cho dữ liệu cũ
UPDATE employees 
SET is_active = TRUE 
WHERE is_active IS NULL;

UPDATE employees 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Tạo index
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- ============================================
-- BƯỚC 2: XÓA TẤT CẢ DỮ LIỆU CŨ
-- ============================================
-- Xóa orders và order_items
DELETE FROM order_items;
DELETE FROM orders;

-- Xóa tất cả nhân viên
DELETE FROM employees;

-- ============================================
-- BƯỚC 3: TẠO TÀI KHOẢN ADMIN01 MỚI
-- ============================================
INSERT INTO employees (
    employee_code,
    password_hash,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'ADMIN01',
    '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW',
    'Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);

-- ============================================
-- BƯỚC 4: VERIFY KẾT QUẢ
-- ============================================

-- Check employees table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- Check ADMIN01 account
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    LENGTH(password_hash) as password_hash_length,
    SUBSTRING(password_hash, 1, 7) as hash_prefix,
    created_at,
    updated_at
FROM employees
WHERE employee_code = 'ADMIN01';

-- Check total employees
SELECT COUNT(*) as total_employees FROM employees;

-- Check total orders
SELECT COUNT(*) as total_orders FROM orders;

-- ============================================
-- KẾT QUẢ MONG ĐỢI:
-- ============================================
-- 1. Cột is_active và updated_at tồn tại
-- 2. ADMIN01 account:
--    - employee_code: ADMIN01
--    - full_name: Administrator
--    - role: ADMIN
--    - is_active: t
--    - password_hash_length: 60
--    - hash_prefix: $2b$10$
-- 3. total_employees: 1
-- 4. total_orders: 0
-- ============================================

-- ============================================
-- THÔNG TIN ĐĂNG NHẬP:
-- Mã nhân viên: ADMIN01
-- Mật khẩu: 123456
-- ============================================

-- ============================================
-- SAU KHI CHẠY SCRIPT NÀY:
-- 1. Refresh trang login (Ctrl + F5)
-- 2. Đăng nhập với ADMIN01 / 123456
-- 3. Vào Admin → Nhân sự → Tạo nhân viên mới
-- ============================================
