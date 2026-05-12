# 🚀 Cinox OmniPOS - Nền tảng bán hàng đa mô hình (F&B & Giải trí)

Giải pháp Point of Sale (Web-based POS) toàn diện và linh hoạt, được thiết kế để mở rộng cho đa dạng mô hình kinh doanh từ rạp chiếu phim (Cinema) đến chuỗi nhà hàng (Fast-food, Buffet). Hệ thống tích hợp quản lý ca làm việc bảo mật cao (Blind Close), báo cáo đối soát dòng tiền và Kitchen Display System (KDS).

## ✨ Tính năng chính

### 🎯 POS (Point of Sale) - Đa mô hình
- **Bán hàng linh hoạt**: Hỗ trợ đa dạng mô hình từ rạp chiếu phim, nhà hàng đến chuỗi F&B
- **Tính tiền thông minh**: Tự động tính tiền thối, hỗ trợ nhiều phương thức thanh toán
- **Quản lý đơn hàng**: Xem lịch sử, hủy đơn, in lại hóa đơn realtime
- **Quản lý ca làm việc (Blind Close)**: 
  - Mở ca với tiền đầu ca (opening float)
  - Đóng ca với đối soát tiền mặt bảo mật
  - Nhân viên không thấy doanh thu trong ca (blind close)
  - Tự động đăng xuất sau khi đóng ca
- **Báo cáo ca**: Nhân viên xem trạng thái ca, Admin xem chi tiết đầy đủ

### 👨‍💼 Admin Panel - Quản lý tập trung
- **Dashboard**: Tổng quan doanh thu, đơn hàng, biểu đồ phân tích theo ca
- **Quản lý nhân sự**: 
  - Tạo tài khoản với phân quyền (Admin, Cashier, Kitchen)
  - Reset mật khẩu, quản lý trạng thái hoạt động
  - Theo dõi hiệu suất nhân viên
- **Báo cáo & Đối soát dòng tiền**: 
  - **Tab "Báo cáo ca làm việc"**: 
    - Xem tất cả ca với chênh lệch tiền mặt
    - Drill-down chi tiết món ăn trong từng ca
    - Phát hiện dư/thiếu tiền với màu sắc trực quan
  - **Tab "Báo cáo doanh thu chi tiết"**: 
    - Báo cáo theo ngày/tháng/năm
    - Filter theo nhân viên, trạng thái
    - Export dữ liệu để phân tích
- **Quản lý thực đơn**: 
  - Thêm/sửa/xóa món ăn
  - Quản lý danh mục
  - Ẩn/hiện món theo tình trạng nguyên liệu

### 🍳 KDS (Kitchen Display System) - Màn hình bếp
- Hiển thị đơn hàng realtime cho bếp
- Cập nhật trạng thái món (Pending → Preparing → Ready)
- Thông báo âm thanh khi có đơn mới
- Tự động refresh mỗi 5 giây
- Hỗ trợ nhiều màn hình bếp (scalable)

### 🔐 Bảo mật & Phân quyền
- **Blind Close**: Nhân viên không thấy doanh thu trong ca
- **Role-based Access Control**: Admin, Cashier, Kitchen
- **JWT Authentication**: Bảo mật session
- **Password Encryption**: bcrypt với 10 rounds
- **Audit Trail**: Theo dõi tất cả thao tác quan trọng

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **Supabase** (PostgreSQL) - Database & Realtime
- **bcrypt** - Mã hóa mật khẩu (10 rounds)
- **JWT** - Authentication & Authorization

### Frontend
- **Vanilla JavaScript** (ES6+) - No framework dependencies
- **HTML5** + **CSS3** - Responsive design
- **Fetch API** - HTTP requests
- **LocalStorage** - Session management

### Database
- **PostgreSQL** (via Supabase)
- **Tables**: employees, categories, products, orders, order_items, shifts
- **Foreign Keys**: Đảm bảo tính toàn vẹn dữ liệu
- **Indexes**: Tối ưu performance cho queries phức tạp

### Architecture
- **RESTful API** - Chuẩn REST cho tất cả endpoints
- **MVC Pattern** - Tách biệt logic và presentation
- **Middleware Chain** - Authentication, Authorization, Error handling
- **Stateless** - Scalable horizontally

## 🎯 Khả năng mở rộng (Scalability)

### Đa mô hình kinh doanh
- ✅ **Rạp chiếu phim**: Bán vé, combo, đồ ăn
- ✅ **Nhà hàng Fast-food**: Order nhanh, KDS
- ✅ **Buffet**: Quản lý bàn, theo dõi món
- ✅ **Chuỗi F&B**: Multi-location support (sẵn sàng)

### Tính năng có thể mở rộng
- 🔄 **Multi-location**: Quản lý nhiều chi nhánh
- 🔄 **Inventory Management**: Quản lý kho, nguyên liệu
- 🔄 **Customer Loyalty**: Tích điểm, khách hàng thân thiết
- 🔄 **Online Ordering**: Tích hợp đặt hàng online
- 🔄 **Payment Gateway**: Tích hợp thanh toán điện tử
- 🔄 **Analytics Dashboard**: Phân tích dữ liệu nâng cao
- 🔄 **Mobile App**: iOS & Android native apps

### Technical Scalability
- **Horizontal Scaling**: Thêm server dễ dàng
- **Database Replication**: Supabase hỗ trợ sẵn
- **CDN Ready**: Static assets có thể deploy lên CDN
- **API Versioning**: Sẵn sàng cho v2, v3...

## 📦 Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/SangTranTamLy/pos-system-graduation.git
cd pos-system-graduation
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Tạo file `.env`:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

### 3. Setup Database
1. Tạo project trên [Supabase](https://supabase.com)
2. Chạy các migration trong thư mục `database/`:
   - `init_schema.sql` - Tạo bảng cơ bản
   - `create_shifts_table.sql` - Tạo bảng ca làm việc
   - `add_payment_columns.sql` - Thêm cột tiền thối
   - `SETUP_SHIFT_MANAGEMENT.sql` - Setup đầy đủ

### 4. Chạy Backend
```bash
npm start
```
Server chạy tại: `http://localhost:3000`

### 5. Chạy Frontend
Sử dụng Live Server (VS Code extension) hoặc bất kỳ static server nào:
```bash
# Với Live Server
# Click chuột phải vào index.html → Open with Live Server
```

Frontend chạy tại: `http://localhost:5500` (hoặc port khác)

## 🚀 Sử dụng

### Đăng nhập

**Admin:**
- URL: `http://localhost:5500/admin.html`
- Mã NV: `ADMIN01`
- Mật khẩu: `123456`

**POS (Nhân viên):**
- URL: `http://localhost:5500/pos.html`
- Mã NV: Tạo từ Admin Panel
- Mật khẩu: Mật khẩu tạm từ Admin

**KDS (Bếp):**
- URL: `http://localhost:5500/kds.html`
- Mã NV: Tài khoản KITCHEN
- Mật khẩu: Mật khẩu tạm từ Admin

### Tạo nhân viên mới
1. Đăng nhập Admin
2. Click menu "Nhân sự"
3. Điền form "Tạo tài khoản nhân viên"
4. Chọn vai trò: Cashier (Thu ngân) hoặc Kitchen (Bếp)
5. Hệ thống tự động tạo mã nhân viên và mật khẩu tạm

### Luồng làm việc

**Nhân viên (Cashier):**
1. Đăng nhập POS
2. Tab "Báo cáo" → Mở ca (nhập tiền đầu ca)
3. Tab "Bán vé" → Bán hàng
4. Tab "Đơn hàng" → Xem lịch sử, hủy đơn nếu cần
5. Tab "Báo cáo" → Đóng ca (nhập tiền thực tế)
6. Hệ thống tự động đăng xuất

**Admin:**
1. Đăng nhập Admin Panel
2. Tab "Báo cáo & Đối soát" → Xem báo cáo ca
3. Click "👁️ Xem chi tiết" để drill-down vào món ăn
4. Phân tích chênh lệch tiền mặt
5. Đối chiếu với camera nếu cần

## 📊 Tính năng nổi bật

### 🔍 Drill-Down Chi Tiết Ca
- Click "👁️ Xem chi tiết" ở bất kỳ ca nào
- Modal popup hiển thị:
  - Thông tin ca: Nhân viên, ngày, giờ mở/đóng
  - Thống kê: Tổng đơn, doanh thu, chênh lệch
  - Bảng chi tiết: Thời gian, mã đơn, tên món, SL, đơn giá, thành tiền, trạng thái
- Chỉ hiển thị món trong khoảng thời gian ca đó

### 💰 Đối Soát Tiền Mặt
- **Tiền đầu ca**: Nhân viên nhập khi mở ca
- **Doanh thu**: Hệ thống tự động tính từ đơn hàng
- **Tiền mong đợi**: Tiền đầu ca + Doanh thu
- **Tiền thực tế**: Nhân viên đếm và nhập khi đóng ca
- **Chênh lệch**: Tiền thực tế - Tiền mong đợi
  - Màu xanh (+): Dư tiền
  - Màu đỏ (-): Thiếu tiền
  - Màu xám (0): Khớp chính xác

### 📈 Báo Cáo Đa Chiều
- **Theo thời gian**: Ngày, tháng, năm
- **Theo nhân viên**: Filter theo mã nhân viên
- **Theo trạng thái**: Đang mở, đã đóng
- **Theo ca**: Sáng, chiều, tối

## 📁 Cấu trúc thư mục

```
pos-system-graduation/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Kết nối Supabase
│   ├── controllers/
│   │   ├── authController.js    # Đăng nhập, đăng xuất
│   │   ├── employeeController.js # Quản lý nhân viên
│   │   ├── orderController.js   # Quản lý đơn hàng
│   │   ├── shiftController.js   # Quản lý ca làm việc
│   │   ├── reportController.js  # Báo cáo
│   │   └── ...
│   ├── middlewares/
│   │   └── authMiddleware.js    # Xác thực JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── shiftRoutes.js
│   │   └── ...
│   ├── server.js                # Entry point
│   └── package.json
├── frontend/
│   ├── css/
│   │   ├── admin.css
│   │   ├── pos.css
│   │   └── kds.css
│   ├── js/
│   │   ├── api.js               # API wrapper
│   │   ├── auth.js              # Authentication
│   │   ├── admin.js
│   │   ├── pos.js
│   │   └── kds.js
│   ├── admin.html
│   ├── pos.html
│   ├── kds.html
│   └── index.html               # Login page
├── database/
│   ├── init_schema.sql          # Schema cơ bản
│   ├── SETUP_SHIFT_MANAGEMENT.sql # Setup ca làm việc
│   ├── INSERT_TEST_SHIFT_NV001.sql # Dữ liệu test
│   └── ...
├── docs/
│   ├── BAO_CAO_TICH_HOP.md      # Tài liệu tích hợp
│   ├── TEST_DRILL_DOWN.md       # Hướng dẫn test
│   ├── ROLES_GUIDE.md           # Hướng dẫn phân quyền
│   └── ...
└── README.md
```

## 🧪 Testing

### Test với dữ liệu mẫu
```sql
-- Chạy trong Supabase SQL Editor
-- File: database/INSERT_TEST_SHIFT_NV001.sql
```

### Test API
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_code":"ADMIN01","password":"123456"}'
```

### Test Frontend
1. Đăng nhập Admin
2. Mở Console (F12)
3. Chạy test scripts trong các file `TEST_*.md`

## 📝 Documentation

- **[BAO_CAO_TICH_HOP.md](./BAO_CAO_TICH_HOP.md)** - Tài liệu tích hợp báo cáo
- **[TEST_DRILL_DOWN.md](./TEST_DRILL_DOWN.md)** - Hướng dẫn test drill-down
- **[DEBUG_KHONG_NHAN_DU_LIEU.md](./DEBUG_KHONG_NHAN_DU_LIEU.md)** - Debug guide
- **[ROLES_GUIDE.md](./docs/ROLES_GUIDE.md)** - Hướng dẫn phân quyền
- **[KDS_TROUBLESHOOTING.md](./docs/KDS_TROUBLESHOOTING.md)** - Troubleshooting KDS

## 🔐 Bảo mật

- Mật khẩu được mã hóa bằng **bcrypt** (10 rounds)
- Authentication sử dụng **JWT** tokens
- Middleware xác thực cho tất cả protected routes
- Role-based access control (ADMIN, CASHIER, KITCHEN)
- Session management với localStorage

## 🐛 Troubleshooting

### Backend không chạy
```bash
# Kiểm tra port 3000 có bị chiếm không
netstat -ano | findstr :3000

# Restart backend
cd backend
npm start
```

### Frontend không kết nối được backend
1. Kiểm tra backend đang chạy: `http://localhost:3000/api/health`
2. Kiểm tra CORS settings trong `server.js`
3. Hard refresh browser: Ctrl + Shift + R

### Lỗi 404 khi gọi API
1. Kiểm tra backend console có log "routes loaded"
2. Restart backend
3. Kiểm tra route path trong code

### Admin không thấy dữ liệu ca
1. Kiểm tra database có dữ liệu: `SELECT * FROM shifts;`
2. Chạy script test: `INSERT_TEST_SHIFT_NV001.sql`
3. Hard refresh Admin Panel
4. Xem hướng dẫn: `DEBUG_KHONG_NHAN_DU_LIEU.md`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sang Tran Tam Ly**
- GitHub: [@SangTranTamLy](https://github.com/SangTranTamLy)

## 🎬 Use Cases

### Rạp chiếu phim (Cinema)
- Bán vé xem phim + combo bắp nước
- Quản lý ca làm việc của nhân viên bán vé
- Đối soát doanh thu theo suất chiếu
- KDS cho quầy bắp nước

### Nhà hàng Fast-food
- Order nhanh tại quầy
- KDS hiển thị đơn cho bếp
- Quản lý ca làm việc nhiều nhân viên
- Báo cáo doanh thu theo ca/ngày/tháng

### Buffet
- Quản lý bàn và order
- Theo dõi món ăn realtime
- Đối soát tiền mặt cuối ca
- Phân tích món ăn phổ biến

### Chuỗi F&B
- Quản lý nhiều chi nhánh (sẵn sàng mở rộng)
- Báo cáo tập trung
- So sánh hiệu suất giữa các chi nhánh
- Quản lý nhân viên đa địa điểm

## 🙏 Acknowledgments

- **Supabase** - Amazing backend platform with PostgreSQL & Realtime
- **Express.js** - Fast, unopinionated web framework
- **bcrypt** - Secure password hashing
- **All contributors and testers** - Thank you for your feedback!

---

**Made with ❤️ for graduation project**
