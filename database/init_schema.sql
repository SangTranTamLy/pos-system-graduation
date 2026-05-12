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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    cooking_instructions TEXT DEFAULT '',
    preparation_time INT DEFAULT 10,
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
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Chi tiết Hóa đơn (Order_Items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    cooking_instructions TEXT DEFAULT '',
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    kitchen_status VARCHAR(20) DEFAULT 'PENDING',
    note TEXT DEFAULT '',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
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
-- Chỉ tạo 1 tài khoản ADMIN
-- Admin sẽ tự tạo tài khoản cho nhân viên qua giao diện
-- Mật khẩu mặc định: 123456
-- ==========================================

INSERT INTO employees (employee_code, password_hash, full_name, role, is_active) VALUES
('ADMIN01', '$2b$10$K7L1OJjM9JxP3P0B1Xr8uOVt9uD8Kk2M8xTjY8Qj5K8Q8dDk4G6mW', 'Administrator', 'ADMIN', TRUE);

-- Tạo danh mục với UUID cố định để dễ map data
INSERT INTO categories (id, name) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Đồ ăn chính'),
('c2000000-0000-0000-0000-000000000002', 'Đồ ăn vặt'),
('c3000000-0000-0000-0000-000000000003', 'Đồ uống');

-- Thêm món ăn với hướng dẫn chế biến
INSERT INTO products (category_id, name, price, image_url, cooking_instructions, preparation_time) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Combo Gà Rán 2 Miếng', 75000, 'https://placehold.co/400x300?text=Ga+Ran', 
'1. Lấy 2 miếng gà từ tủ lạnh\n2. Tẩm bột chiên giòn\n3. Chiên ở 180°C trong 12-15 phút\n4. Để ráo dầu\n5. Bày món kèm khoai tây chiên', 15),
('c1000000-0000-0000-0000-000000000001', 'Burger Bò Phô Mai', 55000, 'https://placehold.co/400x300?text=Burger',
'1. Nướng bánh burger 2 mặt\n2. Chiên patty bò 3 phút mỗi mặt\n3. Thêm phô mai lên patty\n4. Xếp lớp: bánh, xà lách, patty, cà chua, sốt\n5. Đậy bánh và cắt đôi', 10),
('c2000000-0000-0000-0000-000000000002', 'Khoai Tây Chiên Lớn', 35000, 'https://placehold.co/400x300?text=Khoai+Tay',
'1. Lấy khoai tây đông lạnh\n2. Chiên ở 180°C trong 4-5 phút\n3. Để ráo dầu\n4. Rắc muối\n5. Cho vào hộp giấy', 5),
('c3000000-0000-0000-0000-000000000003', 'Nước Ngọt Coca Cola', 20000, 'https://placehold.co/400x300?text=Coca',
'1. Lấy lon/chai Coca từ tủ lạnh\n2. Cho đá vào ly (nếu khách yêu cầu)\n3. Rót nước vào ly\n4. Cắm ống hút', 2);