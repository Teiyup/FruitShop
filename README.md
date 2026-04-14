# 🍎 Cửa Hàng Trái Cây Online

Website bán trái cây hoàn chỉnh với các tính năng: giỏ hàng, đăng nhập/đăng xuất, trang quản lý admin, tìm kiếm sản phẩm và giao diện màu xanh lá sáng trọng.

## Công Nghệ Sử Dụng

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (với Mongoose ODM)
- **JWT** (JSON Web Tokens)
- **bcrypt** (Mã hóa mật khẩu)

### Frontend
- **Angular 21** (Standalone Components)
- **TypeScript**
- **RxJS** (Reactive Programming)
- **CSS3** (Gradient, Flexbox, CSS Grid)

## Cầu Trúc Dự Án

```
KTCK/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Fruit.js
│   │   ├── Order.js
│   │   └── Cart.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── header/
    │   │   │   ├── login/
    │   │   │   ├── products/
    │   │   │   ├── cart/
    │   │   │   ├── orders/
    │   │   │   └── admin/
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   ├── fruit.service.ts
    │   │   │   ├── cart.service.ts
    │   │   │   └── order.service.ts
    │   │   ├── app.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.config.ts
    │   │   └── app.css
    │   ├── styles.css
    │   └── main.ts
    └── package.json
```

## Các Tính Năng

### 👤 Xác Thực Người Dùng
- Đăng nhập với email và mật khẩu
- Đăng ký tài khoản mới
- Đăng xuất
- JWT Token cho bảo mật API

### 🛒 Giỏ Hàng & Thanh Toán
- Thêm/xóa sản phẩm từ giỏ hàng
- Cập nhật số lượng
- Xem tóm tắt đơn hàng
- Nhập thông tin giao hàng
- Tạo đơn hàng

### 🔍 Tìm Kiếm & Bộ Lọc
- Tìm kiếm sản phẩm theo tên
- Hiển thị chi tiết sản phẩm trong modal
- Xem kho hàng

### 📦 Quản Lý Đơn Hàng
- Xem danh sách đơn hàng của người dùng
- Cập nhật trạng thái đơn hàng (Admin)
- Theo dõi tình trạng giao hàng

### ⚙️ Trang Quản Lý Admin
- Thêm/sửa/xóa sản phẩm
- Quản lý tất cả đơn hàng
- Cập nhật trạng thái đơn hàng
- Tạo dữ liệu seed (mẫu)

### 🎨 Giao Diện Lân Công
- Màu xanh lá (#22c55e) làm màu chính
- Responsive design (Mobile-first)
- Gradient backgrounds
- Smooth animations &transitions

## Hướng Dẫn Cài Đặt & Chạy

### 1. Cài Đặt MongoDB

#### Tùy Chọn A: Cài Đặt MongoDB Locally
- Tải từ: https://www.mongodb.com/try/download/community
- Cài đặt và khởi động MongoDB service
- Kiểm tra bằng: `mongosh` hoặc dùng MongoDB Compass

#### Tùy Chọn B: Dùng Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### Tùy Chọn C: Dùng MongoDB Atlas (Cloud)
- Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
- Lấy connection string
- Cập nhật `MONGODB_URI` trong `.env`

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

Cập nhật `.env` (nếu cần):
```
PORT=3000
SECRET_KEY=your-secret-key-fruit-shop
MONGODB_URI=mongodb://localhost:27017/fruit-shop
```

Khởi động server:
```bash
npm start
# hoặc dev mode với auto-reload
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

### 3. Cài Đặt Frontend

```bash
cd frontend
npm install
```

Khởi động Angular development server:
```bash
npm start
# hoặc
ng serve
```

Frontend sẽ chạy tại: `http://localhost:4200`

### 4. Tạo Dữ Liệu Mẫu (Seed Data)

1. Truy cập: `http://localhost:4200/login`
2. Đăng nhập với tài khoản Admin:
   - Email: `admin@fruitshop.com`
   - Mật khẩu: `password` (hash bcrypt)
3. Vào Admin Dashboard (`/admin`)
4. Nhấn nút "⟲ Tạo dữ liệu seed"

## Tài Khoản Demo

### Admin Account
- Email: `admin@fruitshop.com`
- Mật khẩu: `password`
- Quyền: Quản lý sản phẩm, đơn hàng

### User Account
- Email: `user@fruitshop.com`
- Mật khẩu: `password`
- Quyền: Mua hàng, xem đơn hàng

**Lưu ý**: Nếu cơ sở dữ liệu trống, bạn cần tạo các tài khoản này thủ công hoặc các API tự động tạo khi khởi động.

## API Endpoints

### Authentication
- `POST /api/login` - Đăng nhập
- `POST /api/register` - Đăng ký
- `GET /api/me` - Lấy thông tin hiện tại (Require Auth)

### Products
- `GET /api/fruits` - Lấy danh sách sản phẩm (có hỗ trợ search)
- `GET /api/fruits/:id` - Chi tiết sản phẩm
- `POST /api/fruits` - Thêm sản phẩm (Admin)
- `PUT /api/fruits/:id` - Sửa sản phẩm (Admin)
- `DELETE /api/fruits/:id` - Xóa sản phẩm (Admin)

### Cart
- `GET /api/cart/:userId` - Lấy giỏ hàng
- `POST /api/cart/:userId` - Thêm vào giỏ
- `PUT /api/cart/:userId/:fruitId` - Cập nhật số lượng
- `DELETE /api/cart/:userId/:fruitId` - Xóa khỏi giỏ
- `DELETE /api/cart/:userId` - Xóa toàn bộ giỏ

### Orders
- `POST /api/orders` - Tạo đơn hàng (Require Auth)
- `GET /api/orders` - Lấy danh sách đơn hàng (Require Auth)
- `PUT /api/orders/:id` - Cập nhật trạng thái (Admin)

### Utilities
- `POST /api/seed` - Tạo dữ liệu seed (Admin)

## Hòa Sắc Màu (Color Palette)

```css
Primary Green:     #22c55e
Dark Green:        #16a34a
Light Green:       #f0fdf4
Border Green:      #dcfce7
Text Dark:         #166534
Success:           #22c55e
Error:             #dc2626
Warning:           #f59e0b
Info:              #3b82f6
```

## Tuyên Bố Bảo Mật

- Mật khẩu được mã hóa bằng bcrypt (salt rounds: 10)
- JWT tokens có expiration 24h
- Những route admin yêu cầu quyền admin
- CORS được bật cho frontend


## Các Bước Tiếp Theo (Tối Ưu Hóa)

- [ ] Thêm image upload cho sản phẩm
- [ ] Tích hợp payment gateway (Stripe, Momo)
- [ ] Thêm email notification
- [ ] Implement review/rating system
- [ ] Thêm wishlist feature
- [ ] Optimize images với CDN
- [ ] Setup CI/CD pipeline
- [ ] Add unit & e2e testing
- [ ] Setup caching (Redis)
- [ ] Analytics & monitoring

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra MongoDB có chạy không
2. Kiểm tra port 3000 (backend) và 4200 (frontend) có trống không
3. Xóa `node_modules` và cài lại: `npm install`
4. Kiểm tra `.env` file có đúng không
5. Xem logs từ backend: `npm start`

## Giấy Phép

MIT License - tự do sử dụng cho dự án cá nhân

---

**Tạo bởi**: Fruit Shop Development Team
**Phiên bản**: 1.0.0
**Ngày cập nhật**: 2026-03-21
