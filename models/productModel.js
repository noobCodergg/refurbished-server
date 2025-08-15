const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  seller: String,
  title: String,
  price: Number,
  condition: String,
  image: String,
  status: Boolean,
  details: String,
  uploaded_by: String,
  address: String,
  deliveryMethod: String,
  paymentMethod: String
});

const Product = mongoose.model("products", productSchema);

module.exports = Product;
