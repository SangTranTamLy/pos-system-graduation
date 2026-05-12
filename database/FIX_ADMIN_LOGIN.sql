-- ============================================
-- FIX ADMIN LOGIN - Sửa lỗi đăng nhập ADMIN
-- ============================================
-- Lỗi: 401 Unauthorized khi đăng nhập
-- Nguyên nhân: Tài khoản không tồn tại hoặc password hash sai
-- ============================================

-- Bước 1: Kiểm tra tài khoản ADMIN01 có tồn tại không
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    created_at,
    LENGTH(password_hash) as password_hash_length
FROM employees
WHERE employee_code = 'ADMIN01';

-- Nếu không có kết quả → Tài khoản không tồn tại
-- Nếu có kết quả → Kiểm tra password_hash_length phải > 50

-- ============================================
-- Bước 2: XÓA tài khoản ADMIN01 cũ (nếu có)
-- ============================================
DELETE FROM employees WHERE employee_code = 'ADMIN01';

-- ============================================
-- Bước 3: TẠO MỚI tài khoản ADMIN01
-- ============================================
-- Password: 123456
-- QUAN TRỌNG: Bạn NÊN generate hash mới bằng cách:
--   1. cd backend
--   2. node test-password.js
--   3. Copy hash từ output và thay thế vào đây
--
-- Hash dưới đây CHỈ là ví dụ, có thể KHÔNG hoạt động:

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
    '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qNKwGL2YJvLiPqrJLBqKzYKJgKLOu',
    'Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);

-- ============================================
-- HOẶC: Nếu tài khoản đã tồn tại, chỉ cần UPDATE:
-- ============================================
-- UPDATE employees
-- SET password_hash = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qNKwGL2YJvLiPqrJLBqKzYKJgKLOu',
--     updated_at = NOW()
-- WHERE employee_code = 'ADMIN01';

-- ============================================
-- Bước 4: VERIFY tài khoản đã được tạo
-- ============================================
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    LENGTH(password_hash) as password_hash_length,
    created_at
FROM employees
WHERE employee_code = 'ADMIN01';

-- KẾT QUẢ MONG ĐỢI:
-- employee_code: ADMIN01
-- full_name: Administrator
-- role: ADMIN
-- is_active: t (true)
-- password_hash_length: 60
-- created_at: (thời gian hiện tại)

-- ============================================
-- Bước 5: Test đăng nhập
-- ============================================
-- Mã nhân viên: ADMIN01
-- Mật khẩu: 123456
-- 
-- Nếu vẫn lỗi 401:
-- 1. Check backend logs
-- 2. Check authController.js
-- 3. Verify bcrypt.compare() hoạt động
-- ============================================

-- ============================================
-- BONUS: Tạo password hash mới (nếu cần)
-- ============================================
-- Nếu muốn đổi mật khẩu, dùng bcrypt online:
-- https://bcrypt-generator.com/
-- Input: 123456
-- Rounds: 10
-- Output: Copy hash và update:
-- 
-- UPDATE employees 
-- SET password_hash = 'NEW_HASH_HERE'
-- WHERE employee_code = 'ADMIN01';
-- ============================================
