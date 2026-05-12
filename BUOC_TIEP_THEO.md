# 📋 Các bước tiếp theo để deploy lên GitHub Pages

Tôi đã cập nhật code cho bạn. Bây giờ làm theo các bước sau:

---

## ✅ Đã làm xong:

1. ✅ Cập nhật `frontend/js/api.js` - Tự động detect production URL
2. ✅ Cập nhật `backend/server.js` - Thêm CORS cho GitHub Pages

---

## 🚀 BƯỚC 1: Commit và Push code

Mở Terminal/Command Prompt trong VS Code (Ctrl + `), chạy:

```bash
# Add tất cả files đã sửa
git add .

# Commit với message
git commit -m "Update API URL and CORS for production"

# Push lên GitHub
git push origin master
```

**Kết quả mong đợi:**
```
Enumerating objects: X, done.
Writing objects: 100% (X/X), done.
To https://github.com/SangTranTamLy/pos-system-graduation.git
   xxxxx..xxxxx  master -> master
```

✅ Vercel sẽ tự động redeploy backend (đợi 1-2 phút)

---

## 🌐 BƯỚC 2: Tạo branch gh-pages

Vẫn trong Terminal, chạy từng lệnh:

```bash
# Lưu branch hiện tại
git branch

# Tạo branch mới gh-pages
git checkout --orphan gh-pages

# Xóa tất cả files
git rm -rf .

# Copy frontend files
# Windows:
xcopy /E /I frontend\* .

# Mac/Linux:
# cp -r frontend/* .

# Tạo file .nojekyll (quan trọng!)
echo. > .nojekyll

# Add tất cả
git add .

# Commit
git commit -m "Deploy frontend to GitHub Pages"

# Push lên GitHub
git push -f origin gh-pages

# Quay lại branch master
git checkout master
```

**Kết quả mong đợi:**
```
Switched to a new branch 'gh-pages'
[gh-pages xxxxx] Deploy frontend to GitHub Pages
 X files changed, X insertions(+)
To https://github.com/SangTranTamLy/pos-system-graduation.git
 * [new branch]      gh-pages -> gh-pages
Switched to branch 'master'
```

---

## ⚙️ BƯỚC 3: Enable GitHub Pages

### 3.1. Vào Settings

1. Mở browser
2. Vào: https://github.com/SangTranTamLy/pos-system-graduation
3. Click tab **"Settings"** (ở trên cùng)

### 3.2. Vào Pages

1. Ở sidebar bên trái, scroll xuống
2. Click **"Pages"** (gần cuối, trong mục "Code and automation")

### 3.3. Configure

Bạn sẽ thấy form "Build and deployment":

**Source:**
- Chọn: `Deploy from a branch`

**Branch:**
- Chọn: `gh-pages`
- Folder: `/ (root)`
- Click **"Save"**

### 3.4. Đợi Deploy

1. Sau khi Save, GitHub sẽ bắt đầu build
2. Đợi 2-3 phút
3. Refresh trang
4. Bạn sẽ thấy thông báo:
   ```
   Your site is live at https://sangtrantamly.github.io/pos-system-graduation/
   ```

---

## ✅ BƯỚC 4: Kiểm tra

### 4.1. Test Backend (Vercel)

Mở browser, vào:
```
https://pos-system-graduation.vercel.app/api/health
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Server đã hoạt động !"
}
```

### 4.2. Test Frontend (GitHub Pages)

Mở browser, vào:
```
https://sangtrantamly.github.io/pos-system-graduation/
```

**Kết quả mong đợi:**
- Thấy trang login
- Không có lỗi trong Console (F12)

### 4.3. Test Login

1. Đăng nhập:
   - **Mã NV**: `ADMIN01`
   - **Mật khẩu**: `123456`

2. ✅ Vào được Admin Panel

---

## 🐛 Nếu gặp lỗi

### Lỗi 1: "Cannot connect to API"

**Nguyên nhân:** URL Vercel chưa đúng

**Giải pháp:**
1. Kiểm tra URL Vercel của bạn
2. Mở file `frontend/js/api.js`
3. Tìm dòng: `'https://pos-system-graduation.vercel.app'`
4. Thay bằng URL Vercel thực tế của bạn
5. Commit và push lại

### Lỗi 2: "CORS Error"

**Nguyên nhân:** Backend chưa cho phép GitHub Pages domain

**Giải pháp:**
1. Đợi Vercel redeploy xong (sau khi push code ở Bước 1)
2. Nếu vẫn lỗi, kiểm tra `backend/server.js` có dòng:
   ```javascript
   'https://sangtrantamly.github.io',
   ```

### Lỗi 3: "404 Not Found"

**Nguyên nhân:** GitHub Pages chưa build xong

**Giải pháp:**
1. Đợi thêm 5-10 phút
2. Check Actions: https://github.com/SangTranTamLy/pos-system-graduation/actions
3. Đảm bảo build thành công (màu xanh ✅)

### Lỗi 4: "xcopy is not recognized" (Windows)

**Giải pháp:** Dùng lệnh khác:

```bash
# Thay vì xcopy, dùng:
robocopy frontend . /E

# Hoặc copy thủ công:
# 1. Mở thư mục frontend
# 2. Copy tất cả files
# 3. Paste vào thư mục root của branch gh-pages
```

---

## 🎉 Hoàn thành!

Sau khi làm xong 4 bước, bạn sẽ có:

✅ **Backend**: https://pos-system-graduation.vercel.app
✅ **Frontend**: https://sangtrantamly.github.io/pos-system-graduation/
✅ **Admin**: https://sangtrantamly.github.io/pos-system-graduation/admin.html
✅ **POS**: https://sangtrantamly.github.io/pos-system-graduation/pos.html
✅ **KDS**: https://sangtrantamly.github.io/pos-system-graduation/kds.html

**Chia sẻ link để demo! 🚀**

---

## 📞 Cần trợ giúp?

Nếu gặp vấn đề:
1. Chụp màn hình lỗi
2. Check Console (F12) xem có lỗi gì
3. Check Terminal xem lệnh có chạy thành công không
4. Báo lại cho tôi biết

---

**Bắt đầu từ BƯỚC 1 nhé!** 💪
