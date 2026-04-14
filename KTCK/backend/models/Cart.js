const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    fruitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fruit'
    },
    name: String,
    price: Number,
    quantity: Number
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
