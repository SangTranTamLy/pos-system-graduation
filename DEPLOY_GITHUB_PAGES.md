# 🌐 Deploy Cinox OmniPOS lên GitHub Pages + Vercel

Hướng dẫn deploy project với:
- **Frontend**: GitHub Pages (miễn phí)
- **Backend**: Vercel (miễn phí)

---

## ⚠️ Lưu ý quan trọng

GitHub Pages **CHỈ** hỗ trợ static files (HTML, CSS, JavaScript). **KHÔNG** hỗ trợ backend Node.js.

**Giải pháp:**
- Frontend → GitHub Pages
- Backend → Vercel (hoặc Render, Railway)

---

## 🎯 PHẦN 1: Deploy Backend lên Vercel

### Bước 1.1: Tạo tài khoản Vercel

1. Vào https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"
4. Authorize Vercel

### Bước 1.2: Import Project

1. Click "Add New..." → "Project"
2. Chọn repository: `pos-system-graduation`
3. Click "Import"

### Bước 1.3: Configure

**Root Directory:**
```
./
```

**Framework Preset:**
```
Other
```

**Build Command:** (để trống)

**Output Directory:**
```
frontend
```

**Install Command:**
```
cd backend && npm install
```

### Bước 1.4: Environment Variables

Thêm các biến môi trường:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | `your-anon-key` |
| `JWT_SECRET` | `your-secret-key` |
| `NODE_ENV` | `production` |

### Bước 1.5: Deploy

1. Click "Deploy"
2. Đợi 2-3 phút
3. ✅ Backend sẽ có URL: `https://pos-system-graduation.vercel.app`

**Test Backend:**
```
https://pos-system-graduation.vercel.app/api/health
```

---

## 🎨 PHẦN 2: Deploy Frontend lên GitHub Pages

### Bước 2.1: Cập nhật API URL

Sửa file `frontend/js/api.js`:

```javascript
// Thay đổi từ:
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

// Thành:
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://pos-system-graduation.vercel.app'; // ← URL Vercel của bạn
```

### Bước 2.2: Commit và Push

```bash
git add frontend/js/api.js
git commit -m "Update API URL for production"
git push origin master
```

### Bước 2.3: Enable GitHub Pages

1. Vào repository: https://github.com/SangTranTamLy/pos-system-graduation
2. Click **"Settings"**
3. Scroll xuống **"Pages"** (ở sidebar trái)
4. **Source**: Chọn `Deploy from a branch`
5. **Branch**: Chọn `master` và folder `/frontend`
6. Click **"Save"**

⚠️ **Lưu ý:** Nếu không có option chọn folder `/frontend`, làm theo Bước 2.4

### Bước 2.4: Tạo branch gh-pages (nếu cần)

Nếu GitHub Pages không cho chọn folder `/frontend`, tạo branch riêng:

```bash
# Tạo branch mới chỉ chứa frontend
git checkout --orphan gh-pages

# Xóa tất cả files
git rm -rf .

# Copy frontend files
cp -r frontend/* .

# Commit
git add .
git commit -m "Deploy frontend to GitHub Pages"

# Push
git push origin gh-pages

# Quay lại branch master
git checkout master
```

Sau đó trong Settings → Pages:
- **Branch**: Chọn `gh-pages`
- **Folder**: Chọn `/ (root)`

### Bước 2.5: Đợi Deploy

1. GitHub sẽ build và deploy (2-3 phút)
2. URL sẽ là: `https://sangtrantamly.github.io/pos-system-graduation/`
3. ✅ Kiểm tra: Mở URL và test đăng nhập

---

## 🔧 PHẦN 3: Cấu hình CORS

Backend cần cho phép requests từ GitHub Pages.

### Bước 3.1: Cập nhật server.js

Sửa file `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:5501',
    'https://sangtrantamly.github.io',
    'https://pos-system-graduation.vercel.app'
  ],
  credentials: true
}));
```

### Bước 3.2: Push và Redeploy

```bash
git add backend/server.js
git commit -m "Update CORS for GitHub Pages"
git push origin master
```

Vercel sẽ tự động redeploy backend.

---

## ✅ PHẦN 4: Kiểm tra

### Test Backend (Vercel)
```
https://pos-system-graduation.vercel.app/api/health
```

Kết quả:
```json
{
  "success": true,
  "message": "Server đã hoạt động !"
}
```

### Test Frontend (GitHub Pages)
```
https://sangtrantamly.github.io/pos-system-graduation/
```

1. Mở URL
2. Đăng nhập: `ADMIN01` / `123456`
3. ✅ Vào được Admin Panel

---

## 🎯 URLs cuối cùng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Backend** | `https://pos-system-graduation.vercel.app` | API Server |
| **Frontend** | `https://sangtrantamly.github.io/pos-system-graduation/` | Web App |
| **Admin** | `https://sangtrantamly.github.io/pos-system-graduation/admin.html` | Admin Panel |
| **POS** | `https://sangtrantamly.github.io/pos-system-graduation/pos.html` | POS Interface |
| **KDS** | `https://sangtrantamly.github.io/pos-system-graduation/kds.html` | Kitchen Display |

---

## 🐛 Troubleshooting

### Lỗi 1: "404 Page Not Found" trên GitHub Pages

**Nguyên nhân:** GitHub Pages chưa build xong

**Giải pháp:**
1. Đợi 5-10 phút
2. Check Actions tab: https://github.com/SangTranTamLy/pos-system-graduation/actions
3. Đảm bảo build thành công (màu xanh)

### Lỗi 2: "CORS Error"

**Nguyên nhân:** Backend chưa cho phép GitHub Pages domain

**Giải pháp:**
1. Cập nhật CORS trong `server.js` (Phần 3.1)
2. Push code
3. Đợi Vercel redeploy

### Lỗi 3: "Cannot connect to API"

**Nguyên nhân:** API_BASE_URL chưa đúng

**Giải pháp:**
1. Kiểm tra `frontend/js/api.js`
2. Đảm bảo URL Vercel đúng
3. Push code lại

### Lỗi 4: "Mixed Content" (HTTP/HTTPS)

**Nguyên nhân:** GitHub Pages dùng HTTPS, backend dùng HTTP

**Giải pháp:**
- Vercel tự động dùng HTTPS
- Đảm bảo API_BASE_URL dùng `https://`

---

## 📊 So sánh các nền tảng

| Nền tảng | Frontend | Backend | Database | Miễn phí |
|----------|----------|---------|----------|----------|
| **GitHub Pages** | ✅ | ❌ | ❌ | ✅ |
| **Vercel** | ✅ | ✅ | ❌ | ✅ |
| **Netlify** | ✅ | ✅ (Functions) | ❌ | ✅ |
| **Render** | ✅ | ✅ | ✅ | ✅ (limited) |
| **Railway** | ✅ | ✅ | ✅ | ✅ ($5 credit) |

**Khuyến nghị cho project này:**
- Frontend: GitHub Pages
- Backend: Vercel
- Database: Supabase

Tất cả đều miễn phí! 🎉

---

## 🚀 Workflow tự động

### Setup GitHub Actions (Optional)

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
          publish_branch: gh-pages
```

Mỗi khi push code frontend, GitHub sẽ tự động deploy!

---

## 📝 Checklist Deploy

### Backend (Vercel)
- [ ] Đã tạo tài khoản Vercel
- [ ] Đã import repository
- [ ] Đã thêm Environment Variables
- [ ] Backend deploy thành công
- [ ] Test `/api/health` OK

### Frontend (GitHub Pages)
- [ ] Đã cập nhật API_BASE_URL
- [ ] Đã push code
- [ ] Đã enable GitHub Pages
- [ ] Đã chọn branch và folder
- [ ] Frontend deploy thành công
- [ ] Test đăng nhập OK

### CORS
- [ ] Đã cập nhật CORS trong server.js
- [ ] Đã thêm GitHub Pages domain
- [ ] Vercel đã redeploy
- [ ] Không còn CORS error

---

## 🎓 Video hướng dẫn

- Deploy Vercel: https://www.youtube.com/watch?v=...
- GitHub Pages: https://www.youtube.com/watch?v=...
- Setup CORS: https://www.youtube.com/watch?v=...

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check Vercel Logs
2. Check GitHub Actions
3. Check Browser Console (F12)
4. Tạo Issue trên GitHub

---

## ✅ Hoàn thành!

Bây giờ project của bạn đã online:
- ✅ Backend trên Vercel
- ✅ Frontend trên GitHub Pages
- ✅ Database trên Supabase
- ✅ Hoàn toàn miễn phí!

**Live Demo:** https://sangtrantamly.github.io/pos-system-graduation/

**Chia sẻ link này để demo project! 🚀**
