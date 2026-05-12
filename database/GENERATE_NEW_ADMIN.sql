-- ============================================
-- GENERATE NEW ADMIN ACCOUNT
-- ============================================
-- Hướng dẫn:
-- 1. Chạy: cd backend && node test-password.js
-- 2. Copy hash từ output (dòng "New hash generated:")
-- 3. Thay thế HASH_FROM_NODE_SCRIPT bên dưới
-- 4. Chạy SQL này trong Supabase
-- ============================================

-- Bước 1: Xóa tài khoản cũ (nếu có)
DELETE FROM employees WHERE employee_code = 'ADMIN01';

-- Bước 2: Tạo tài khoản mới với hash vừa generate
-- THAY THẾ 'HASH_FROM_NODE_SCRIPT' bằng hash thật từ test-password.js
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
    'HASH_FROM_NODE_SCRIPT',  -- ⚠️ THAY THẾ DÒNG NÀY
    'Administrator',
    'ADMIN',
    TRUE,
    NOW(),
    NOW()
);

-- Bước 3: Verify
SELECT 
    employee_code,
    full_name,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 10) as hash_prefix
FROM employees
WHERE employee_code = 'ADMIN01';

-- Kết quả mong đợi:
-- employee_code: ADMIN01
-- full_name: Administrator
-- role: ADMIN
-- is_active: t
-- hash_length: 60
-- hash_prefix: $2b$10$ hoặc $2a$10$

-- ============================================
-- VÍ DỤ OUTPUT TỪ test-password.js:
-- ============================================
-- --- Generating NEW hash ---
-- ✅ New hash generated:
-- $2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
-- Length: 60
-- New hash works: ✅ YES
--
-- ==> COPY hash trên và thay thế vào INSERT statement
-- ============================================
