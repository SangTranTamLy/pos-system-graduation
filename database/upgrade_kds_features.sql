-- ==========================================
-- MIGRATION: Nâng Cấp Tính Năng KDS
-- ==========================================
-- File này dùng để thêm các trường mới cho hệ thống KDS

-- 1. Thêm cột hướng dẫn chế biến và thời gian chuẩn bị vào bảng products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cooking_instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS preparation_time INT DEFAULT 10;

-- 2. Cập nhật hướng dẫn cho các món hiện có
UPDATE products 
SET cooking_instructions = '1. Lấy 2 miếng gà từ tủ lạnh
2. Tẩm bột chiên giòn
3. Chiên ở 180°C trong 12-15 phút
4. Để ráo dầu
5. Bày món kèm khoai tây chiên',
    preparation_time = 15
WHERE name = 'Combo Gà Rán 2 Miếng';

UPDATE products 
SET cooking_instructions = '1. Nướng bánh burger 2 mặt
2. Chiên patty bò 3 phút mỗi mặt
3. Thêm phô mai lên patty
4. Xếp lớp: bánh, xà lách, patty, cà chua, sốt
5. Đậy bánh và cắt đôi',
    preparation_time = 10
WHERE name = 'Burger Bò Phô Mai';

UPDATE products 
SET cooking_instructions = '1. Lấy khoai tây đông lạnh
2. Chiên ở 180°C trong 4-5 phút
3. Để ráo dầu
4. Rắc muối
5. Cho vào hộp giấy',
    preparation_time = 5
WHERE name = 'Khoai Tây Chiên Lớn';

UPDATE products 
SET cooking_instructions = '1. Lấy lon/chai Coca từ tủ lạnh
2. Cho đá vào ly (nếu khách yêu cầu)
3. Rót nước vào ly
4. Cắm ống hút',
    preparation_time = 2
WHERE name = 'Nước Ngọt Coca Cola';

-- 3. Thêm các cột mới vào bảng order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255),
ADD COLUMN IF NOT EXISTS kitchen_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 4. Cập nhật product_name_snapshot cho các order_items hiện có
UPDATE order_items oi
SET product_name_snapshot = p.name
FROM products p
WHERE oi.product_id = p.id
AND oi.product_name_snapshot IS NULL;

-- 5. Tạo index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_order_items_kitchen_status ON order_items(kitchen_status);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

-- 6. Xác nhận kết quả
SELECT 
    'Products with cooking instructions' as info,
    COUNT(*) as count
FROM products 
WHERE cooking_instructions IS NOT NULL AND cooking_instructions != '';

SELECT 
    'Order items with kitchen status' as info,
    kitchen_status,
    COUNT(*) as count
FROM order_items 
GROUP BY kitchen_status;
