-- ============================================
-- 🚨 CHẠY FILE NÀY TRONG SUPABASE SQL EDITOR
-- ============================================
-- Mục đích: Fix lỗi không thể tạo nhân viên
-- Thời gian: ~30 giây
-- ============================================

-- Bước 1: Thêm cột is_active
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Bước 2: Thêm cột updated_at
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Bước 3: Set giá trị mặc định cho dữ liệu cũ
UPDATE employees 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Bước 4: Tạo index để tăng performance
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- Bước 5: Verify kết quả
SELECT 
    'SUCCESS: Migration completed!' as status,
    COUNT(*) as total_employees,
    COUNT(*) FILTER (WHERE is_active = TRUE) as active_employees,
    COUNT(*) FILTER (WHERE is_active = FALSE) as inactive_employees
FROM employees;

-- Bước 6: Kiểm tra cấu trúc bảng
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- ============================================
-- ✅ SAU KHI CHẠY XONG:
-- 1. Restart backend: Ctrl+C → npm start
-- 2. Refresh Admin page: Ctrl+F5
-- 3. Test tạo nhân viên mới
-- ============================================
