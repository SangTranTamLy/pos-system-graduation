-- ==========================================
-- MIGRATION: Thêm Tính Năng Hủy Đơn
-- ==========================================
-- File này dùng để thêm cột cancellation_reason vào bảng orders

-- 1. Thêm cột cancellation_reason
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 2. Thêm index để tối ưu query theo status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 3. Xác nhận kết quả
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'cancellation_reason';

-- 4. Kiểm tra các trạng thái đơn hàng hiện có
SELECT 
    status,
    COUNT(*) as count
FROM orders 
GROUP BY status;
