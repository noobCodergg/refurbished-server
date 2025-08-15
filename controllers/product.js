const productModel = require('../models/productModel')
const wishModel = require('../models/wishModel')
const cartModel = require('../models/cartModel')
const fs = require('fs');
const path = require('path');

exports.uploadProduct = async (req, res) => {
  try {
    const { 
      seller,
      title,  
      price, 
      condition,
      status, 
      details, 
      uploaded_by,
      address,
      deliveryMethod,
      paymentMethod
    } = req.body;

    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newProduct = await productModel.create({
      seller,
      title,
      price,
      condition,
      image: image.path, 
      status,
      details,
      uploaded_by,
      address,
      deliveryMethod,
      paymentMethod
    });

    res.status(200).json({
      message: "Product uploaded successfully",
      data: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};



exports.getProductByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const search = req.query.search || ''; // get the search query from frontend

    const products = await productModel.find({
      uploaded_by: userId,
      title: { $regex: search, $options: 'i' } // case-insensitive search on title
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProductByUserId:", error);
    res.status(500).json("Internal Server Error");
  }
};


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await productModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, details } = req.body;

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.title = title;
    product.price = price;
    product.details = details;

    if (req.file) {
      // Delete old image if it exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', product.image); // product.image stores "uploads/filename"
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.image = `uploads/${req.file.filename}`; // Store full relative path
    }

    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    // Sort so that status false come first, true come later
    const products = await productModel.find().sort({ status: 1 }); 
    // assuming status is boolean and false < true, ascending order puts false first

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
  }
};




exports.updateProductStatus = async (req, res) => {
  const { id } = req.params; 
  

  try {
    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.status = true; // update status
    await product.save();

    res.status(200).json({ message: 'Product status updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};


exports.getProductByStatus = async (req, res) => {
  try {
    const search = req.query.search || '';

    const products = await productModel.find({
      status: true, 
      title: { $regex: search, $options: 'i' }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProductByUserId:", error);
    res.status(500).json("Internal Server Error");
  }
};



exports.postWish = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json("ProductId and UserId are required");
    }

    
    const existing = await wishModel.findOne({ productId, userId });

    if (existing) {
      return res.status(400).json("Product already in wishlist");
    }

    
    await wishModel.create({ productId, userId });

    res.status(200).json("Added to wishlist");
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};



exports.postCart = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    // Check if product already exists in user's cart
    const existingCartItem = await cartModel.findOne({ productId, userId });

    if (existingCartItem) {
      // Increment quantity by 1
      existingCartItem.quantity += 1;
      await existingCartItem.save();
      return res.status(200).json("Cart updated: quantity increased by 1");
    }

    // If not exist, create new cart item
    await cartModel.create({ productId, userId });
    res.status(200).json("Added to cart");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};



const mongoose = require('mongoose');

exports.getWish = async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await wishModel.aggregate([
      { $match: { userId } },

      // Convert string productId to ObjectId for lookup
      {
        $addFields: {
          productObjectId: { $toObjectId: "$productId" }
        }
      },

      {
        $lookup: {
          from: 'products',
          localField: 'productObjectId',  
          foreignField: '_id',
          as: 'productDetails',
        },
      },

      { $unwind: '$productDetails' },

      {
        $project: {
          _id: 1,
          userId: 1,
          date: 1,
          productId: '$productDetails._id',
          title: '$productDetails.title',
          image: '$productDetails.image',
          condition: '$productDetails.condition',
          price: '$productDetails.price',
        },
      },
    ]);

    res.status(200).json(list);
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
};



exports.deleteWish = async(req,res)=>{
  try{
    const {wishId} = req.params;

    await wishModel.deleteOne({_id:wishId})
    res.status(200).json("Deleted")
  }catch(error){
    res.status(500).json("Internal Server Error")
  }
}


exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await cartModel.aggregate([
      { $match: { userId } },

      // Convert string productId to ObjectId
      {
        $addFields: {
          productObjectId: { $toObjectId: "$productId" }
        }
      },

      // Join with products collection
      {
        $lookup: {
          from: 'products',
          localField: 'productObjectId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },

      { $unwind: '$productDetails' },

      // Project required fields including quantity
      {
        $project: {
          _id: 1,
          userId: 1,
          date: 1,
          quantity: 1,
          productId: '$productDetails._id',
          title: '$productDetails.title',
          image: '$productDetails.image',
          condition: '$productDetails.condition',
          price: '$productDetails.price',
          totalPrice: { $multiply: ['$quantity', '$productDetails.price'] }, // total per item
        },
      },
    ]);

    const cartTotal = list.reduce((acc, item) => acc + item.totalPrice, 0);

    res.status(200).json({ list, cartTotal });
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
};




exports.deleteCart = async(req,res)=>{
  try{
    const {cartId} = req.params;

    await cartModel.deleteOne({_id:cartId})
    res.status(200).json("Deleted")
  }catch(error){
    res.status(500).json("Internal Server Error")
  }
}


exports.updateQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { newQuantity } = req.body;

    if (newQuantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const updatedCart = await cartModel.findByIdAndUpdate(
      cartId,
      { $set: { quantity: newQuantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json(updatedCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};






