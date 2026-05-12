-- ============================================
-- CREATE SHIFTS TABLE - Quản lý ca làm việc
-- ============================================

-- Bảng Shifts (Ca làm việc)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) REFERENCES employees(employee_code) ON DELETE RESTRICT,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0, -- Tiền lẻ đầu ca
    closing_cash DECIMAL(12,2), -- Tiền thực tế cuối ca
    expected_cash DECIMAL(12,2), -- Tiền mong đợi (tính từ orders)
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

-- Index
CREATE INDEX IF NOT EXISTS idx_shifts_employee_code ON shifts(employee_code);
CREATE INDEX IF NOT EXISTS idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Constraint: Mỗi nhân viên chỉ có 1 ca OPEN trong 1 ngày
CREATE UNIQUE INDEX IF NOT EXISTS idx_shifts_unique_open 
ON shifts(employee_code, shift_date) 
WHERE status = 'OPEN';

-- ============================================
-- VERIFY
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- Kết quả mong đợi:
-- id               | uuid        | NO
-- employee_code    | varchar     | YES
-- shift_date       | date        | NO
-- opening_cash     | numeric     | NO
-- closing_cash     | numeric     | YES
-- expected_cash    | numeric     | YES
-- cash_difference  | numeric     | YES
-- total_orders     | integer     | YES
-- total_revenue    | numeric     | YES
-- status           | varchar     | YES
-- opened_at        | timestamptz | YES
-- closed_at        | timestamptz | YES
-- notes            | text        | YES
-- created_at       | timestamptz | YES
-- updated_at       | timestamptz | YES

-- ============================================
-- DONE!
-- ============================================
