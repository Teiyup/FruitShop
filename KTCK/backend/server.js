const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Import Models
const User = require('./models/User');
const Fruit = require('./models/Fruit');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Coupon = require('./models/Coupon');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-fruit-shop';

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fruit-shop')
  .then(() => {
    console.log('Kết nối MongoDB thành công');
  })
  .catch(err => {
    console.log('Lỗi kết nối MongoDB:', err);
  });

// Middleware xác verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp' });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// ===== AUTHENTICATION ROUTES =====
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    await newUser.save();
    
    res.status(201).json({ message: 'Đăng ký thành công', user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== PRODUCT ROUTES =====
app.get('/api/fruits', async (req, res) => {
  try {
    const search = req.query.search;
    
    if (search) {
      const filtered = await Fruit.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
      return res.json(filtered);
    }
    
    const fruits = await Fruit.find();
    res.json(fruits);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get('/api/fruits/:id', async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);
    if (!fruit) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(fruit);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Admin: Add fruit
app.post('/api/fruits', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const { name, price, image, category, description, stock } = req.body;
    const newFruit = new Fruit({
      name,
      price,
      image,
      category,
      description,
      stock: stock || 100
    });
    
    await newFruit.save();
    res.status(201).json(newFruit);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Admin: Update fruit
app.put('/api/fruits/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const fruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fruit) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    res.json(fruit);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Admin: Delete fruit
app.delete('/api/fruits/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const fruit = await Fruit.findByIdAndDelete(req.params.id);
    if (!fruit) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== CART ROUTES =====
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.post('/api/cart/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { fruitId, quantity } = req.body;
    
    let cart = await Cart.findOne({ userId });
    const fruit = await Fruit.findById(fruitId);
    
    if (!fruit) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }
    
    const cartItem = cart.items.find(item => item.fruitId.toString() === fruitId);
    
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.items.push({
        fruitId,
        name: fruit.name,
        price: fruit.price,
        quantity
      });
    }
    
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.put('/api/cart/:userId/:fruitId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const fruitId = req.params.fruitId;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    
    const cartItem = cart.items.find(item => item.fruitId.toString() === fruitId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });
    }
    
    cartItem.quantity = quantity;
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.delete('/api/cart/:userId/:fruitId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const fruitId = req.params.fruitId;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    
    cart.items = cart.items.filter(item => item.fruitId.toString() !== fruitId);
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.delete('/api/cart/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: 'Xóa giỏ hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== ORDER ROUTES =====
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalPrice, address, phone, couponCode } = req.body;
    
    let discountAmount = 0;
    let finalPrice = totalPrice;
    
    // Validate and apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (totalPrice >= coupon.minOrderValue) {
            if (coupon.discountType === 'percent') {
              discountAmount = (totalPrice * coupon.discountValue) / 100;
            } else {
              discountAmount = coupon.discountValue;
            }
            finalPrice = Math.max(0, totalPrice - discountAmount);
            
            // Increase coupon usage count
            await Coupon.findByIdAndUpdate(coupon._id, { usedCount: coupon.usedCount + 1 });
          }
        }
      }
    }
    
    const newOrder = new Order({
      userId: req.user.id,
      items,
      totalPrice,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      discountAmount,
      finalPrice,
      address,
      phone,
      status: 'pending'
    });
    
    await newOrder.save();
    await Cart.findOneAndDelete({ userId: req.user.id });
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    let orders;
    if (user.role === 'admin') {
      orders = await Order.find().populate('userId', 'name email');
      // Add userName field for frontend compatibility
      orders = orders.map(order => ({
        ...order.toObject(),
        userName: order.userId?.name || 'N/A'
      }));
    } else {
      orders = await Order.find({ userId: userId }).populate('userId', 'name email');
      orders = orders.map(order => ({
        ...order.toObject(),
        userName: order.userId?.name || 'N/A'
      }));
    }
    
    res.json(orders || []);
  } catch (error) {
    console.error('Lỗi GET /api/orders:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Admin: Update order status
app.put('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== USER MANAGEMENT ROUTES (Admin Only) =====
// Get all users
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User không được xác thực' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const users = await User.find({}, { password: 0 }); // Exclude password
    res.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ message: 'Xóa người dùng thành công', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update user role
app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ message: 'Cập nhật role thành công', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== COUPON MANAGEMENT ROUTES (Admin Only) =====
// Get all coupons
app.get('/api/coupons', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User không được xác thực' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    console.error('Error in GET /api/coupons:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create coupon
app.post('/api/coupons', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User không được xác thực' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const { code, discountType, discountValue, maxUses, minOrderValue, expiryDate, description } = req.body;
    
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Mã coupon đã tồn tại' });
    }
    
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses: maxUses || null,
      minOrderValue: minOrderValue || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      description,
      isActive: true
    });
    
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update coupon
app.put('/api/coupons/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const { discountType, discountValue, maxUses, minOrderValue, expiryDate, description, isActive } = req.body;
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        discountType,
        discountValue,
        maxUses: maxUses || null,
        minOrderValue: minOrderValue || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        description,
        isActive
      },
      { new: true }
    );
    
    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Không tìm thấy coupon' });
    }
    
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete coupon
app.delete('/api/coupons/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    }
    
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Không tìm thấy coupon' });
    }
    
    res.json({ message: 'Xóa coupon thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Validate coupon
app.post('/api/validate-coupon', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã coupon' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Mã coupon không tồn tại' });
    }
    
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Mã coupon không còn hoạt động' });
    }
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Mã coupon đã hết hạn' });
    }
    
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Mã coupon đã đạt giới hạn sử dụng' });
    }
    
    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({ message: `Đơn hàng phải có giá trị tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ` });
    }
    
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    
    res.json({ 
      coupon, 
      discountAmount,
      finalPrice: Math.max(0, orderTotal - discountAmount)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== SEED DATA (Optional - for initial data) =====
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data (fruits and coupons only, keep users to avoid logout)
    await Fruit.deleteMany({});
    await Coupon.deleteMany({});
    
    // Add sample fruits
    const fruits = [
      { name: 'Táo đỏ', price: 25000, image: 'https://via.placeholder.com/400/FF6B6B/FFFFFF?text=Apple', category: 'trái_cây', description: 'Táo đỏ tươi ngon', stock: 50 },
      { name: 'Chuối', price: 15000, image: 'https://via.placeholder.com/400/FFD93D/000000?text=Banana', category: 'trái_cây', description: 'Chuối vàng chín', stock: 75 },
      { name: 'Ổi', price: 20000, image: 'https://via.placeholder.com/400/A8E6CF/000000?text=Guava', category: 'trái_cây', description: 'Ổi ngọt sánh', stock: 60 },
      { name: 'Cam', price: 30000, image: 'https://via.placeholder.com/400/FF9F1C/FFFFFF?text=Orange', category: 'trái_cây', description: 'Cam ngọt juicy', stock: 40 },
      { name: 'Dâu tây', price: 45000, image: 'https://via.placeholder.com/400/FF6B6B/FFFFFF?text=Berry', category: 'trái_cây', description: 'Dâu tây tươi', stock: 30 },
      { name: 'Dưa hấu', price: 35000, image: 'https://via.placeholder.com/400/2DD4BF/000000?text=Melon', category: 'trái_cây', description: 'Dưa hấu ngọt mát', stock: 25 }
    ];
    
    await Fruit.insertMany(fruits);
    
    // Create test users if they don't exist
    const adminExists = await User.findOne({ email: 'admin@ktck.vn' });
    const userExists = await User.findOne({ email: 'user@ktck.vn' });
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Quản trị viên',
        email: 'admin@ktck.vn',
        password: adminPassword,
        role: 'admin'
      });
    }
    
    if (!userExists) {
      const userPassword = await bcrypt.hash('user123', 10);
      await User.create({
        name: 'Người dùng Test',
        email: 'user@ktck.vn',
        password: userPassword,
        role: 'user'
      });
    }

    // Add sample coupons
    const coupons = [
      {
        code: 'SUMMER20',
        discountType: 'percent',
        discountValue: 20,
        maxUses: 100,
        minOrderValue: 100000,
        expiryDate: new Date('2026-09-30'),
        description: 'Giảm 20% cho đơn hàng từ 100.000đ',
        isActive: true,
        usedCount: 0
      },
      {
        code: 'WELCOME50K',
        discountType: 'fixed',
        discountValue: 50000,
        maxUses: 50,
        minOrderValue: 200000,
        expiryDate: new Date('2026-12-31'),
        description: 'Giảm 50.000đ cho đơn hàng từ 200.000đ',
        isActive: true,
        usedCount: 0
      },
      {
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 30000,
        maxUses: null,
        minOrderValue: 150000,
        expiryDate: new Date('2026-06-30'),
        description: 'Miễn phí vận chuyển đơn từ 150.000đ',
        isActive: true,
        usedCount: 0
      }
    ];

    await Coupon.insertMany(coupons);
    
    res.json({ message: 'Dữ liệu seed thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
