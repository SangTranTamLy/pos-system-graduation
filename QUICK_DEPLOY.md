# ⚡ Quick Deploy - Chạy project trên web trong 10 phút

Hướng dẫn nhanh nhất để có project online.

---

## 🎯 Tổng quan

**Bạn cần:**
- ✅ Tài khoản GitHub (đã có)
- ✅ Tài khoản Vercel (đăng ký miễn phí)
- ✅ Tài khoản Supabase (đã có)

**Kết quả:**
- 🌐 Frontend: `https://sangtrantamly.github.io/pos-system-graduation/`
- 🔧 Backend: `https://pos-system-graduation.vercel.app`

---

## 🚀 BƯỚC 1: Deploy Backend (3 phút)

### 1.1. Đăng nhập Vercel
1. Vào https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"

### 1.2. Import Project
1. Click "Add New..." → "Project"
2. Chọn `pos-system-graduation`
3. Click "Import"

### 1.3. Configure
- **Root Directory**: `./`
- **Framework Preset**: `Other`
- **Build Command**: (để trống)
- **Output Directory**: `frontend`
- **Install Command**: `cd backend && npm install`

### 1.4. Environment Variables
Click "Environment Variables", thêm:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_KEY = eyJhbGc...
JWT_SECRET = your-secret-key
NODE_ENV = production
```

### 1.5. Deploy
1. Click "Deploy"
2. Đợi 2 phút
3. ✅ Copy URL: `https://pos-system-graduation.vercel.app`

**Test:**
```
https://pos-system-graduation.vercel.app/api/health
```

---

## 🌐 BƯỚC 2: Deploy Frontend (5 phút)

### 2.1. Cập nhật API URL

Mở file `frontend/js/api.js`, tìm dòng:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;
```

Đổi thành:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://pos-system-graduation.vercel.app'; // ← URL Vercel
```

### 2.2. Commit và Push

```bash
git add frontend/js/api.js
git commit -m "Update API URL for production"
git push origin master
```

### 2.3. Enable GitHub Pages

1. Vào https://github.com/SangTranTamLy/pos-system-graduation/settings/pages
2. **Source**: `Deploy from a branch`
3. **Branch**: `master`
4. **Folder**: `/frontend`
5. Click **"Save"**

⚠️ **Nếu không có option `/frontend`**, làm theo 2.4

### 2.4. Tạo branch gh-pages (nếu cần)

```bash
# Tạo branch mới
git checkout --orphan gh-pages

# Xóa tất cả
git rm -rf .

# Copy frontend
cp -r frontend/* .

# Tạo .nojekyll
touch .nojekyll

# Commit
git add .
git commit -m "Deploy to GitHub Pages"

# Push
git push -f origin gh-pages

# Quay lại master
git checkout master
```

Sau đó:
1. Vào Settings → Pages
2. **Branch**: `gh-pages`
3. **Folder**: `/ (root)`
4. Click "Save"

### 2.5. Đợi Deploy

Đợi 2-3 phút, sau đó mở:
```
https://sangtrantamly.github.io/pos-system-graduation/
```

---

## 🔧 BƯỚC 3: Fix CORS (2 phút)

### 3.1. Cập nhật server.js

Mở `backend/server.js`, tìm dòng `app.use(cors())`, đổi thành:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5500',
    'https://sangtrantamly.github.io',
    'https://pos-system-graduation.vercel.app'
  ],
  credentials: true
}));
```

### 3.2. Push

```bash
git add backend/server.js
git commit -m "Update CORS for GitHub Pages"
git push origin master
```

Vercel sẽ tự động redeploy (1-2 phút).

---

## ✅ BƯỚC 4: Test

### Test Backend
```
https://pos-system-graduation.vercel.app/api/health
```

### Test Frontend
```
https://sangtrantamly.github.io/pos-system-graduation/
```

### Test Login
- Mã NV: `ADMIN01`
- Mật khẩu: `123456`

---

## 🎉 Hoàn thành!

**URLs của bạn:**
- 🌐 **Web App**: https://sangtrantamly.github.io/pos-system-graduation/
- 🔧 **API**: https://pos-system-graduation.vercel.app
- 👨‍💼 **Admin**: https://sangtrantamly.github.io/pos-system-graduation/admin.html
- 🎯 **POS**: https://sangtrantamly.github.io/pos-system-graduation/pos.html
- 🍳 **KDS**: https://sangtrantamly.github.io/pos-system-graduation/kds.html

**Chia sẻ link để demo! 🚀**

---

## 🐛 Nếu có lỗi

### Lỗi: "Cannot connect to API"
- Kiểm tra URL Vercel trong `api.js`
- Đảm bảo backend đã deploy thành công

### Lỗi: "CORS Error"
- Kiểm tra CORS trong `server.js`
- Đợi Vercel redeploy

### Lỗi: "404 Not Found"
- Đợi GitHub Pages build xong (5-10 phút)
- Check Actions: https://github.com/SangTranTamLy/pos-system-graduation/actions

---

## 📞 Cần trợ giúp?

Xem hướng dẫn chi tiết:
- [DEPLOY_GITHUB_PAGES.md](./DEPLOY_GITHUB_PAGES.md)
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

---

**Tổng thời gian: ~10 phút** ⏱️
