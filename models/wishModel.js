const mongoose = require('mongoose');

const wishSchema = new mongoose.Schema({
  productId: String,
  userId: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('wishlists', wishSchema);
