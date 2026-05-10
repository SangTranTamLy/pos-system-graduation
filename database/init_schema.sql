-- 1. Kích hoạt extension sinh UUID (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo Custom Types (ENUM) cho Roles và Trạng thái đơn hàng
CREATE TYPE role_type AS ENUM ('ADMIN', 'CASHIER', 'KITCHEN');
CREATE TYPE order_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- 3. Bảng Nhân viên (Employees)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role role_type NOT NULL DEFAULT 'CASHIER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Danh mục (Categories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Món ăn (Products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Hóa đơn (Orders)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) REFERENCES employees(employee_code) ON DELETE RESTRICT,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status order_status NOT NULL DEFAULT 'COMPLETED',
    payment_method VARCHAR(50) DEFAULT 'CASH',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Chi tiết Hóa đơn (Order_Items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bảng Lưu vết Hệ thống (Audit_Logs)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(20) NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Đánh Index tối ưu hiệu suất truy vấn
CREATE INDEX idx_orders_employee_code ON orders(employee_code);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_products_category_id ON products(category_id);

-- ==========================================
-- DỮ LIỆU MỒI (SEED DATA)
-- Mật khẩu mặc định cho tất cả tài khoản dưới đây là: 123456 
-- (Sử dụng mã hash BCrypt thực tế để test API đăng nhập ngay)
-- ==========================================

INSERT INTO employees (employee_code, password_hash, full_name, role) VALUES
('ADMIN01', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Châu Thanh Sang', 'ADMIN'),
('NV001', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Nguyên Hoàng Trung Hiếu', 'CASHIER'),
('NV002', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Mai Trần Thiện Tâm', 'CASHIER');

-- Tạo danh mục với UUID cố định để dễ map data
INSERT INTO categories (id, name) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Đồ ăn chính'),
('c2000000-0000-0000-0000-000000000002', 'Đồ ăn vặt'),
('c3000000-0000-0000-0000-000000000003', 'Đồ uống');

-- Thêm món ăn
INSERT INTO products (category_id, name, price, image_url) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Combo Gà Rán 2 Miếng', 75000, 'https://placehold.co/400x300?text=Ga+Ran'),
('c1000000-0000-0000-0000-000000000001', 'Burger Bò Phô Mai', 55000, 'https://placehold.co/400x300?text=Burger'),
('c2000000-0000-0000-0000-000000000002', 'Khoai Tây Chiên Lớn', 35000, 'https://placehold.co/400x300?text=Khoai+Tay'),
('c3000000-0000-0000-0000-000000000003', 'Nước Ngọt Coca Cola', 20000, 'https://placehold.co/400x300?text=Coca');