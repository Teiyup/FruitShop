const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    fruitId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  couponCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
