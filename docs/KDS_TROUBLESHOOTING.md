# 🔧 KDS Troubleshooting Guide

## Vấn Đề: Alert Vô Hạn "127.0.0.1:5501 cho biết..."

### Nguyên Nhân
1. **Backend chưa chạy** - Server Node.js chưa được khởi động
2. **Database chưa có dữ liệu** - Bảng `order_items` chưa có cột mới
3. **CORS Error** - Frontend và Backend khác port
4. **Token hết hạn** - JWT token đã expire

---

## ✅ Giải Pháp Từng Bước

### Bước 1: Kiểm Tra Backend
```bash
cd backend
npm start
```

**Kết quả mong đợi:**
```
Server running on port 3000
```

Nếu lỗi, kiểm tra:
- File `.env` có đầy đủ thông tin Supabase chưa?
- Port 3000 có bị chiếm không?

---

### Bước 2: Cập Nhật Database

Chạy migration để thêm các cột mới:

```sql
-- Chạy file này trong Supabase SQL Editor
database/upgrade_kds_features.sql
```

Hoặc chạy từng lệnh:

```sql
-- Thêm cột vào products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cooking_instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS preparation_time INT DEFAULT 10;

-- Thêm cột vào order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR(255),
ADD COLUMN IF NOT EXISTS kitchen_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Cập nhật product_name_snapshot
UPDATE order_items oi
SET product_name_snapshot = p.name
FROM products p
WHERE oi.product_id = p.id
AND oi.product_name_snapshot IS NULL;
```

---

### Bước 3: Test API Trực Tiếp

Mở browser console hoặc Postman, test API:

```javascript
// Test 1: Login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employee_code: 'KITCHEN01',
    password: '123456'
  })
})
.then(r => r.json())
.then(console.log);

// Test 2: Get KDS Orders (thay YOUR_TOKEN)
fetch('http://localhost:3000/api/kds/orders', {
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(console.log);
```

---

### Bước 4: Kiểm Tra Console

Mở **DevTools** (F12) → Tab **Console**

**Lỗi thường gặp:**

#### 1. CORS Error
```
Access to fetch at 'http://localhost:3000/api/kds/orders' 
from origin 'http://127.0.0.1:5501' has been blocked by CORS policy
```

**Giải pháp:** Thêm CORS vào backend

```javascript
// backend/server.js
const cors = require('cors');
app.use(cors());
```

#### 2. 401 Unauthorized
```
{success: false, message: "Token không hợp lệ hoặc đã hết hạn"}
```

**Giải pháp:** Đăng xuất và đăng nhập lại

#### 3. 500 Internal Server Error
```
{success: false, message: "Không thể tải danh sách đơn bếp"}
```

**Giải pháp:** Kiểm tra backend logs để xem lỗi chi tiết

---

### Bước 5: Tạo Dữ Liệu Test

Nếu không có đơn hàng, tạo dữ liệu test:

```sql
-- Tạo đơn hàng test
INSERT INTO orders (id, employee_code, total_amount, status, created_at)
VALUES 
  (gen_random_uuid(), 'NV001', 95000, 'PENDING', NOW());

-- Lấy order_id vừa tạo
SELECT id FROM orders ORDER BY created_at DESC LIMIT 1;

-- Tạo order_items (thay ORDER_ID và PRODUCT_ID)
INSERT INTO order_items (
  order_id, 
  product_id, 
  product_name_snapshot, 
  quantity, 
  unit_price, 
  kitchen_status
)
VALUES (
  'ORDER_ID_HERE',
  (SELECT id FROM products WHERE name = 'Combo Gà Rán 2 Miếng'),
  'Combo Gà Rán 2 Miếng',
  2,
  75000,
  'PENDING'
);
```

---

## 🔍 Debug Checklist

- [ ] Backend đang chạy (port 3000)
- [ ] Database đã có cột mới (cooking_instructions, kitchen_status, etc.)
- [ ] Token còn hạn (đăng nhập lại nếu cần)
- [ ] CORS đã được enable trong backend
- [ ] Có ít nhất 1 order_items với kitchen_status = 'PENDING'
- [ ] Browser console không có lỗi đỏ
- [ ] Network tab shows 200 OK cho API calls

---

## 📊 Test Flow Hoàn Chỉnh

### 1. Đăng nhập bằng KITCHEN01
```
URL: http://127.0.0.1:5501/frontend/index.html
Mã NV: KITCHEN01
Mật khẩu: 123456
```

### 2. Kiểm tra redirect
```
Phải tự động chuyển đến: kds.html
```

### 3. Kiểm tra hiển thị
```
- Header: Hiển thị tên user "Nguyễn Văn Bếp"
- Summary: Hiển thị số lượng đơn (có thể là 0)
- Board: Hiển thị "Chưa Có Đơn Hàng" hoặc danh sách đơn
```

### 4. Test realtime
```
1. Mở tab mới → Đăng nhập NV001 (CASHIER)
2. Tạo đơn hàng mới ở POS
3. Quay lại tab KDS
4. Sau 10 giây, đơn mới phải xuất hiện
```

---

## 🚨 Lỗi Vòng Lặp Vô Hạn

**Triệu chứng:** Alert hiện liên tục, không dừng được

**Nguyên nhân:** 
- `showError()` gọi `alert()` trong vòng lặp refresh
- API trả về lỗi → alert → refresh → lỗi → alert...

**Đã fix:**
```javascript
// TRƯỚC (SAI)
catch (error) {
  showError("Không thể tải..."); // Alert vô hạn!
}

// SAU (ĐÚNG)
catch (error) {
  console.error("Lỗi:", error); // Chỉ log, không alert
  kitchenOrders = [];
  renderBoard(); // Hiển thị empty state
}
```

---

## 📞 Liên Hệ Hỗ Trợ

Nếu vẫn gặp lỗi, cung cấp thông tin sau:

1. **Backend logs** (terminal output)
2. **Browser console** (F12 → Console tab)
3. **Network tab** (F12 → Network → Click vào request lỗi)
4. **Database schema** (chạy `\d order_items` trong psql)

---

## ✅ Kết Luận

Sau khi làm theo các bước trên:
- ✅ Backend chạy ổn định
- ✅ Database có đầy đủ cột
- ✅ API trả về data đúng
- ✅ Frontend hiển thị không lỗi
- ✅ Realtime refresh hoạt động

**Hệ thống KDS đã sẵn sàng! 🎉**
