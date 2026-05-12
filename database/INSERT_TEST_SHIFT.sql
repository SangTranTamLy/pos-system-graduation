-- ============================================
-- INSERT TEST SHIFT DATA
-- Chạy trong Supabase SQL Editor để tạo dữ liệu test
-- ============================================

-- BƯỚC 1: Kiểm tra nhân viên có tồn tại không
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'CASH001') THEN
    RAISE EXCEPTION 'Nhân viên CASH001 chưa tồn tại! Hãy tạo nhân viên trước.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'CASH002') THEN
    RAISE EXCEPTION 'Nhân viên CASH002 chưa tồn tại! Hãy tạo nhân viên trước.';
  END IF;
  
  RAISE NOTICE '✅ Nhân viên CASH001 và CASH002 đã tồn tại';
END $$;

-- BƯỚC 2: Xóa dữ liệu test cũ (nếu có)
-- ============================================
DELETE FROM shifts WHERE employee_code IN ('CASH001', 'CASH002');

-- BƯỚC 3: Insert ca test
-- ============================================

-- Insert ca test 1: CASH001 - Dư tiền
INSERT INTO shifts (
  employee_code,
  shift_date,
  opening_cash,
  closing_cash,
  expected_cash,
  cash_difference,
  total_revenue,
  total_orders,
  status,
  opened_at,
  closed_at,
  notes
) VALUES (
  'CASH001',
  CURRENT_DATE,
  500000,
  2500000,
  2400000,
  100000,
  1900000,
  15,
  'CLOSED',
  CURRENT_TIMESTAMP - INTERVAL '8 hours',
  CURRENT_TIMESTAMP - INTERVAL '30 minutes',
  'Ca test - dư tiền'
);

-- Insert ca test 2: CASH001 - Thiếu tiền
INSERT INTO shifts (
  employee_code,
  shift_date,
  opening_cash,
  closing_cash,
  expected_cash,
  cash_difference,
  total_revenue,
  total_orders,
  status,
  opened_at,
  closed_at,
  notes
) VALUES (
  'CASH001',
  CURRENT_DATE - INTERVAL '1 day',
  500000,
  2300000,
  2400000,
  -100000,
  1900000,
  12,
  'CLOSED',
  CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours',
  CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes',
  'Ca test - thiếu tiền'
);

-- Insert ca test 3: CASH002 - Khớp chính xác
INSERT INTO shifts (
  employee_code,
  shift_date,
  opening_cash,
  closing_cash,
  expected_cash,
  cash_difference,
  total_revenue,
  total_orders,
  status,
  opened_at,
  closed_at,
  notes
) VALUES (
  'CASH002',
  CURRENT_DATE,
  500000,
  2400000,
  2400000,
  0,
  1900000,
  18,
  'CLOSED',
  CURRENT_TIMESTAMP - INTERVAL '8 hours',
  CURRENT_TIMESTAMP - INTERVAL '1 hour',
  'Ca test - khớp chính xác'
);

-- Insert ca test 4: CASH002 - Đang mở
INSERT INTO shifts (
  employee_code,
  shift_date,
  opening_cash,
  status,
  opened_at,
  notes
) VALUES (
  'CASH002',
  CURRENT_DATE,
  500000,
  'OPEN',
  CURRENT_TIMESTAMP - INTERVAL '2 hours',
  'Ca test - đang mở'
);

-- BƯỚC 4: Kiểm tra dữ liệu đã insert
-- ============================================
SELECT 
  s.id,
  s.employee_code,
  e.full_name as employee_name,
  s.shift_date,
  s.opening_cash,
  s.closing_cash,
  s.expected_cash,
  s.cash_difference,
  s.total_revenue,
  s.total_orders,
  s.status,
  TO_CHAR(s.opened_at, 'HH24:MI') as opened_time,
  TO_CHAR(s.closed_at, 'HH24:MI') as closed_time
FROM shifts s
LEFT JOIN employees e ON s.employee_code = e.employee_code
WHERE s.employee_code IN ('CASH001', 'CASH002')
ORDER BY s.shift_date DESC, s.opened_at DESC;

-- Kết quả mong đợi: 4 dòng
-- 1. CASH002 - Trần Thị B - OPEN (hôm nay)
-- 2. CASH002 - Trần Thị B - CLOSED (hôm nay, chênh lệch 0)
-- 3. CASH001 - Nguyễn Văn A - CLOSED (hôm nay, chênh lệch +100k)
-- 4. CASH001 - Nguyễn Văn A - CLOSED (hôm qua, chênh lệch -100k)

-- ============================================
-- HƯỚNG DẪN
-- ============================================
-- Nếu gặp lỗi "Nhân viên CASH001 chưa tồn tại":
-- 1. Đăng nhập Admin Panel (ADMIN01 / 123456)
-- 2. Click menu "Nhân sự"
-- 3. Tạo nhân viên:
--    - Họ tên: Nguyễn Văn A
--    - Vai trò: Cashier (Thu ngân)
-- 4. Tạo nhân viên:
--    - Họ tên: Trần Thị B
--    - Vai trò: Cashier (Thu ngân)
-- 5. Chạy lại script này
