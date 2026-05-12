-- Migration: Thêm cột is_active vào bảng employees
-- Mục đích: Quản lý trạng thái hoạt động của nhân viên (có thể khóa tài khoản)

-- Thêm cột is_active với giá trị mặc định TRUE
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Thêm cột updated_at để tracking thời gian cập nhật
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Cập nhật tất cả nhân viên hiện tại thành active
UPDATE employees 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Tạo index để tăng tốc query filter theo is_active
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);

-- Comment
COMMENT ON COLUMN employees.is_active IS 'Trạng thái hoạt động của nhân viên (TRUE = đang hoạt động, FALSE = đã khóa)';
COMMENT ON COLUMN employees.updated_at IS 'Thời gian cập nhật thông tin nhân viên gần nhất';
