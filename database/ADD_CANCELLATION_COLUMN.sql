-- ============================================
-- ADD CANCELLATION_REASON COLUMN TO ORDERS
-- ============================================
-- Lỗi: Could not find the 'cancellation_reason' column
-- Giải pháp: Thêm cột vào bảng orders
-- ============================================

-- Bước 1: Thêm cột cancellation_reason
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Bước 2: Thêm cột updated_at (cần cho cancelOrder function)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Bước 3: Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Kết quả mong đợi:
-- id                  | uuid        | NO
-- employee_code       | varchar     | YES
-- total_amount        | numeric     | NO
-- status              | USER-DEFINED| NO
-- payment_method      | varchar     | YES
-- cancellation_reason | text        | YES  ← PHẢI CÓ DÒNG NÀY
-- created_at          | timestamptz | YES
-- updated_at          | timestamptz | YES  ← PHẢI CÓ DÒNG NÀY

-- ============================================
-- DONE! Bây giờ test lại trong POS
-- ============================================
