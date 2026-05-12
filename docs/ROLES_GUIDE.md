# Hướng Dẫn Phân Quyền Hệ Thống POS

## Tổng Quan

Hệ thống POS có 3 loại tài khoản với quyền hạn khác nhau:

### 1. ADMIN (Quản Lý)
- **Quyền hạn**: Toàn quyền quản lý hệ thống
- **Màn hình mặc định**: Admin Dashboard (`admin.html`)
- **Chức năng**:
  - Quản lý nhân viên
  - Xem báo cáo doanh thu
  - Quản lý menu (thêm/sửa/xóa món)
  - Truy cập màn hình POS (với preview mode)
  - Truy cập màn hình KDS (Kitchen Display)

### 2. CASHIER (Thu Ngân)
- **Quyền hạn**: Bán hàng và xử lý đơn hàng
- **Màn hình mặc định**: POS (`pos.html`)
- **Chức năng**:
  - Tạo đơn hàng
  - Chọn món từ menu
  - Thanh toán
  - Xem lịch sử đơn hàng của mình

### 3. KITCHEN (Bếp)
- **Quyền hạn**: Xem và xử lý đơn hàng bếp
- **Màn hình mặc định**: KDS - Kitchen Display System (`kds.html`)
- **Chức năng**:
  - Xem danh sách đơn hàng cần chế biến
  - Cập nhật trạng thái món ăn (Pending → Preparing → Ready)
  - Theo dõi thời gian chế biến

## Tài Khoản Mẫu

Tất cả tài khoản đều có mật khẩu mặc định: **123456**

| Mã Nhân Viên | Họ Tên | Vai Trò | Màn Hình |
|--------------|--------|---------|----------|
| ADMIN01 | Châu Thanh Sang | ADMIN | admin.html |
| NV001 | Nguyên Hoàng Trung Hiếu | CASHIER | pos.html |
| NV002 | Mai Trần Thiện Tâm | CASHIER | pos.html |
| KITCHEN01 | Nguyễn Văn Bếp | KITCHEN | kds.html |
| KITCHEN02 | Trần Thị Bếp | KITCHEN | kds.html |

## Luồng Đăng Nhập

```
Người dùng nhập mã nhân viên + mật khẩu
           ↓
    Hệ thống xác thực
           ↓
    Kiểm tra role trong database
           ↓
    ┌──────────┬──────────┬──────────┐
    ↓          ↓          ↓          ↓
  ADMIN    CASHIER    KITCHEN    (Lỗi)
    ↓          ↓          ↓          ↓
admin.html  pos.html   kds.html  index.html
```

## Logic Bảo Vệ Trang

### auth.js (Đăng nhập)
```javascript
const getTargetRoute = (user) => {
  if (CinoxAPI.isAdminUser(user)) {
    return "./admin.html";
  } else if (user.role === "KITCHEN") {
    return "./kds.html";
  } else {
    return "./pos.html";
  }
};
```

### pos.js (Màn hình bán hàng)
- Chặn KITCHEN → chuyển về kds.html
- Chặn ADMIN → chuyển về admin.html (trừ khi có ?preview=1)
- Cho phép CASHIER truy cập

### kds.js (Màn hình bếp)
- Cho phép ADMIN và KITCHEN truy cập
- Chặn CASHIER → chuyển về pos.html
- Ẩn nút "Quay lại Admin" nếu user là KITCHEN

### admin.js (Màn hình quản lý)
- Chỉ cho phép ADMIN truy cập
- Chặn tất cả role khác → chuyển về pos.html

## API Utilities

File `api.js` cung cấp các hàm kiểm tra role:

```javascript
CinoxAPI.isAdminUser(user)    // Kiểm tra ADMIN
CinoxAPI.isCashierUser(user)  // Kiểm tra CASHIER
CinoxAPI.isKitchenUser(user)  // Kiểm tra KITCHEN
```

## Cách Thêm Tài Khoản Mới

### 1. Thêm vào Database
```sql
INSERT INTO employees (employee_code, password_hash, full_name, role) 
VALUES ('KITCHEN03', '$2b$10$...', 'Tên Nhân Viên', 'KITCHEN');
```

### 2. Hash Mật Khẩu
Sử dụng bcrypt với salt rounds = 10:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('123456', 10);
```

## Bảo Mật

- Mật khẩu được hash bằng bcrypt (không lưu plain text)
- JWT token hết hạn sau 8 giờ (1 ca làm việc)
- Mỗi trang đều kiểm tra session và role trước khi render
- Token được lưu trong localStorage hoặc sessionStorage

## Mở Rộng

Để thêm role mới:

1. Cập nhật ENUM trong database:
```sql
ALTER TYPE role_type ADD VALUE 'NEW_ROLE';
```

2. Thêm hàm kiểm tra trong `api.js`:
```javascript
const isNewRoleUser = (user) => (user?.role || "").toUpperCase() === "NEW_ROLE";
```

3. Cập nhật logic routing trong `auth.js`

4. Tạo trang mới và thêm logic bảo vệ
