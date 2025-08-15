const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: String,
  userId: String,
  quantity: { type: Number, default: 1 }, // Added quantity with default 1
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('carts', cartSchema);
