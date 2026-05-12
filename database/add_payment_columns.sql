-- ============================================
-- ADD PAYMENT COLUMNS TO ORDERS
-- ============================================
-- Thêm cột để lưu thông tin tiền khách đưa và tiền thối
-- ============================================

-- Thêm cột customer_paid (tiền khách đưa)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_paid DECIMAL(12,2) DEFAULT 0;

-- Thêm cột change_amount (tiền thối lại)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS change_amount DECIMAL(12,2) DEFAULT 0;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Kết quả mong đợi phải có:
-- customer_paid   | numeric
-- change_amount   | numeric

-- ============================================
-- DONE!
-- ============================================
