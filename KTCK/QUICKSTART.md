# 🚀 Hướng Dẫn Khởi Động Nhanh

## Bước 1: Chuẩn Bị Môi Trường

### 1.1 Kiểm Tra Node.js
```bash
node --version  # Nên >= v18.0.0
npm --version
```

### 1.2 Kiểm Tra MongoDB
Chọn một trong các cách:

**Cách 1: Local MongoDB**
```bash
# Windows - Check MongoDB service running
Get-Service -Name MongoDB

# Mac/Linux
brew services list | grep mongodb
```

**Cách 2: Docker**
```bash
docker ps | grep mongodb
```

**Cách 3: Check MongoDB Compass**
- Mở MongoDB Compass
- Kiểm tra connection tới `mongodb://localhost:27017`

---

## Bước 2: Khởi Động Backend

### Terminal 1 - Backend

```bash
# Đi tới thư mục backend
cd "c:\Users\Admin\Documents\LTGDWEB\KTCK\backend"

# Cài đặt dependencies (lần đầu tiên)
npm install

# Khởi động server
npm start
```

**Kết quả mong đợi:**
```
Server chạy tại http://localhost:3000
Kết nối MongoDB thành công
```

---

## Bước 3: Khởi Động Frontend

### Terminal 2 - Frontend

```bash
# Đi tới thư mục frontend (terminal mới)
cd "c:\Users\Admin\Documents\LTGDWEB\KTCK\frontend"

# Cài đặt dependencies (lần đầu tiên)
npm install

# Khởi động Angular dev server
npm start
```

**Kết quả mong đợi:**
```
✔ Compiled successfully.
✔ Application bundle generation complete.

Local:         http://localhost:4200/
```

---

## Bước 4: Truy Cập Ứng Dụng

1. Mở browser tại: **http://localhost:4200**
2. Trang sẽ tải lên với giao diện xanh lá

---

## Bước 5: Đăng Nhập & Khám Phá

### Tài Khoản Admin
```
Email: admin@fruitshop.com
Mật khẩu: password
```

### Tài Khoản Người Dùng Thường
```
Email: user@fruitshop.com
Mật khẩu: password
```

---

## Các Trang Chính

### 👨‍👩‍👧‍👦 Người Dùng Thường
- **Trang Chủ** (`/`) - Xem sản phẩm, tìm kiếm
- **Giỏ Hàng** (`/cart`) - Quản lý giỏ, thanh toán
- **Đơn Hàng** (`/orders`) - Xem lịch sử mua hàng

### 👨‍💼 Admin
- **Quản Lý Sản Phẩm** (`/admin`) - Tab "Quản Lý Sản Phẩm"
- **Quản Lý Đơn Hàng** (`/admin`) - Tab "Quản Lý Đơn Hàng"

---

## Xử Lý Sự Cố Thường Gặp

### ❌ Lỗi: "Port 3000/4200 already in use"
**Giải pháp:**
```bash
# Windows - Kill process trên port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Mac/Linux
kill -9 $(lsof -t -i:3000)
```

### ❌ Lỗi: "MongoDB connection refused"
**Giải pháp:**
```bash
# Khởi động MongoDB
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Docker
docker start mongodb
```

### ❌ Lỗi: "Cannot find module"
**Giải pháp:**
```bash
# Clear cache & reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ Angular: "ERROR in src/app/app.html..."
**Giải pháp:**
- Chắc chắn các file component đã được tạo đúng
- Restart `npm start`

---

## Lệnh Hữu Ích

### Backend
```bash
# Dev mode with auto-reload
npm run dev

# Xem logs
npm start
```

### Frontend
```bash
# Build for production
npm run build

# Run tests
npm test

# Build watch mode
npm run watch
```

---

## Cộng Thông Tin Hữu Ích

### Frontend Directory Structure
```
frontend/src/app/
├── components/
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.css
│   ├── login/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   └── admin/
├── services/
│   ├── auth.service.ts
│   ├── fruit.service.ts
│   ├── cart.service.ts
│   └── order.service.ts
├── app.ts
├── app.routes.ts
├── app.config.ts
└── app.css
```

### MongoDB Collections
```
fruit-shop
├── users
├── fruits
├── orders
└── carts
```

---

## Tips & Tricks

### 🎨 Thay Đổi Màu Chính
File: `frontend/src/styles.css`
```css
:root {
  --primary-green: #22c55e;  /* Thay giá trị này */
  --dark-green: #16a34a;
  --light-green: #f0fdf4;
  --border-green: #dcfce7;
  --text-dark: #166534;
}
```

### 🔑 API URL
File: `frontend/src/app/services/*.ts`
- Backend URL: `http://localhost:3000/api`
- Thay đổi nếu deploy tới server khác

### 💾 Database Mẫu
Admin → Dashboard → "Tạo dữ liệu seed"
- Sẽ xóa dữ liệu cũ
- Thêm 6 sản phẩm mẫu

---

## Tiếp Theo

1. ✅ Cài đặt và chạy ứng dụng
2. ✅ Khám phá các tính năng
3. ✅ Đăng ký tài khoản mới (Signup)
4. ✅ Mua hàng và thanh toán
5. 📖 Xem `README.md` để hiểu chi tiết hơn

---

**Happy Shopping! 🛒🍎**
