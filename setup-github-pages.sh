#!/bin/bash

# Script tự động setup GitHub Pages
# Chạy: bash setup-github-pages.sh

echo "🚀 Setup GitHub Pages cho Cinox OmniPOS"
echo "========================================"
echo ""

# Bước 1: Nhập URL Vercel
echo "📝 Bước 1: Nhập URL Backend Vercel"
echo "Ví dụ: https://pos-system-graduation.vercel.app"
read -p "URL Vercel của bạn: " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo "❌ Lỗi: URL không được để trống!"
    exit 1
fi

echo "✅ URL Vercel: $VERCEL_URL"
echo ""

# Bước 2: Cập nhật API URL trong frontend
echo "📝 Bước 2: Cập nhật API URL trong frontend/js/api.js"

# Backup file gốc
cp frontend/js/api.js frontend/js/api.js.backup

# Cập nhật API_BASE_URL
sed -i.bak "s|window.location.origin|'$VERCEL_URL'|g" frontend/js/api.js

echo "✅ Đã cập nhật API URL"
echo ""

# Bước 3: Tạo branch gh-pages
echo "📝 Bước 3: Tạo branch gh-pages"

# Lưu branch hiện tại
CURRENT_BRANCH=$(git branch --show-current)

# Tạo branch gh-pages
git checkout --orphan gh-pages

# Xóa tất cả files
git rm -rf .

# Copy frontend files
cp -r frontend/* .

# Tạo .nojekyll để GitHub Pages không ignore files bắt đầu bằng _
touch .nojekyll

# Commit
git add .
git commit -m "Deploy frontend to GitHub Pages"

echo "✅ Đã tạo branch gh-pages"
echo ""

# Bước 4: Push lên GitHub
echo "📝 Bước 4: Push lên GitHub"
git push -f origin gh-pages

echo "✅ Đã push lên GitHub"
echo ""

# Quay lại branch gốc
git checkout $CURRENT_BRANCH

echo "========================================"
echo "✅ Setup hoàn tất!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Vào https://github.com/SangTranTamLy/pos-system-graduation/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: gh-pages"
echo "4. Folder: / (root)"
echo "5. Click Save"
echo ""
echo "🌐 URL GitHub Pages:"
echo "https://sangtrantamly.github.io/pos-system-graduation/"
echo ""
echo "⏰ Đợi 2-3 phút để GitHub Pages build xong"
echo "========================================"
