-- ==========================================
-- MIGRATION: Thêm Tài Khoản Bếp (KITCHEN)
-- ==========================================
-- File này dùng để thêm tài khoản bếp vào database đã tồn tại
-- Chạy file này nếu bạn đã chạy init_schema.sql trước đó

-- Kiểm tra và thêm tài khoản KITCHEN nếu chưa tồn tại
INSERT INTO employees (employee_code, password_hash, full_name, role) 
VALUES 
  ('KITCHEN01', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Nguyễn Văn Bếp', 'KITCHEN'),
  ('KITCHEN02', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Trần Thị Bếp', 'KITCHEN')
ON CONFLICT (employee_code) DO NOTHING;

-- Xác nhận kết quả
SELECT employee_code, full_name, role 
FROM employees 
WHERE role = 'KITCHEN'
ORDER BY employee_code;
