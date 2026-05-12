-- ============================================
-- INSERT TEST SHIFT DATA - Sử dụng nhân viên hiện có
-- Chạy trong Supabase SQL Editor để tạo dữ liệu test
-- ============================================

-- BƯỚC 1: Kiểm tra nhân viên hiện có
-- ============================================
SELECT employee_code, full_name, role 
FROM employees 
WHERE role IN ('CASHIER', 'ADMIN')
ORDER BY employee_code;

-- Kết quả sẽ hiển thị danh sách nhân viên
-- Ví dụ: NV001, NV002, ADMIN01, etc.

-- BƯỚC 2: Xóa dữ liệu test cũ (nếu có)
-- ============================================
-- Thay 'NV001' bằng mã nhân viên bạn muốn dùng
DELETE FROM shifts WHERE employee_code = 'NV001';

-- BƯỚC 3: Insert ca test cho NV001
-- ============================================

-- Ca test 1: Dư tiền (+100.000đ)
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
  'NV001',
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

-- Ca test 2: Thiếu tiền (-100.000đ)
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
  'NV001',
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

-- Ca test 3: Khớp chính xác (0đ)
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
  'NV001',
  CURRENT_DATE - INTERVAL '2 days',
  500000,
  2400000,
  2400000,
  0,
  1900000,
  18,
  'CLOSED',
  CURRENT_TIMESTAMP - INTERVAL '2 days 8 hours',
  CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour',
  'Ca test - khớp chính xác'
);

-- Ca test 4: Đang mở (OPEN)
INSERT INTO shifts (
  employee_code,
  shift_date,
  opening_cash,
  status,
  opened_at,
  notes
) VALUES (
  'NV001',
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
  TO_CHAR(s.opened_at, 'DD/MM/YYYY HH24:MI') as opened_time,
  TO_CHAR(s.closed_at, 'DD/MM/YYYY HH24:MI') as closed_time
FROM shifts s
LEFT JOIN employees e ON s.employee_code = e.employee_code
WHERE s.employee_code = 'NV001'
ORDER BY s.shift_date DESC, s.opened_at DESC;

-- Kết quả mong đợi: 4 dòng
-- 1. NV001 - OPEN (hôm nay)
-- 2. NV001 - CLOSED (hôm nay, chênh lệch +100k)
-- 3. NV001 - CLOSED (hôm qua, chênh lệch -100k)
-- 4. NV001 - CLOSED (2 ngày trước, chênh lệch 0)

-- ============================================
-- HƯỚNG DẪN
-- ============================================
-- 1. Chạy BƯỚC 1 để xem danh sách nhân viên
-- 2. Thay 'NV001' bằng mã nhân viên bạn muốn dùng
-- 3. Chạy toàn bộ script
-- 4. Kiểm tra Admin Panel → "Báo cáo & Đối soát"
