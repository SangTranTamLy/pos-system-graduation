-- ============================================
-- SETUP SHIFT MANAGEMENT - Quản lý ca làm việc
-- ============================================
-- Chạy file này trong Supabase SQL Editor
-- ============================================

-- BƯỚC 1: Tạo bảng shifts
-- ============================================
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) REFERENCES employees(employee_code) ON DELETE RESTRICT,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0, -- Tiền lẻ đầu ca (float từ Admin)
    closing_cash DECIMAL(12,2), -- Tiền thực tế cuối ca
    expected_cash DECIMAL(12,2), -- Tiền mong đợi (opening_cash + doanh thu)
    cash_difference DECIMAL(12,2), -- Chênh lệch (closing - expected)
    total_orders INT DEFAULT 0, -- Tổng số đơn
    total_revenue DECIMAL(12,2) DEFAULT 0, -- Tổng doanh thu
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, CLOSED
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index để tăng tốc query
CREATE INDEX IF NOT EXISTS idx_shifts_employee_code ON shifts(employee_code);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Constraint: Mỗi nhân viên chỉ có 1 ca OPEN trong 1 ngày
CREATE UNIQUE INDEX IF NOT EXISTS idx_shifts_unique_open 
ON shifts(employee_code, shift_date) 
WHERE status = 'OPEN';

-- ============================================
-- BƯỚC 2: Thêm cột vào bảng orders
-- ============================================
-- Thêm cột customer_paid (tiền khách đưa)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_paid DECIMAL(12,2) DEFAULT 0;

-- Thêm cột change_amount (tiền thối lại)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS change_amount DECIMAL(12,2) DEFAULT 0;

-- ============================================
-- BƯỚC 3: Verify
-- ============================================
-- Kiểm tra bảng shifts
SELECT 
    'shifts' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- Kiểm tra cột mới trong orders
SELECT 
    'orders' as table_name,
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('customer_paid', 'change_amount');

-- ============================================
-- BƯỚC 4: Test data (Optional)
-- ============================================
-- Uncomment để test
/*
-- Mở ca test cho NV001
INSERT INTO shifts (
    employee_code, 
    shift_date, 
    opening_cash, 
    status
) VALUES (
    'NV001',
    CURRENT_DATE,
    500000,
    'OPEN'
);

-- Verify
SELECT * FROM shifts WHERE employee_code = 'NV001' ORDER BY opened_at DESC LIMIT 1;
*/

-- ============================================
-- KẾT QUẢ MONG ĐỢI
-- ============================================
-- ✅ Bảng shifts đã được tạo với 14 cột
-- ✅ Bảng orders có thêm 2 cột: customer_paid, change_amount
-- ✅ Index và constraint đã được tạo
-- ============================================

SELECT '✅ SETUP SHIFT MANAGEMENT HOÀN TẤT!' as status;
