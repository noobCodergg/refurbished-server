const express = require("express");
const { uploadProduct, getProductByUserId,getProductById, deleteProduct,updateProduct, getAllProducts, updateProductStatus, getProductByStatus, postWish, postCart, getWish, deleteWish, getCart, deleteCart, updateQuantity } = require("../controllers/product");
const upload = require('../middlewares/multer')


const router = express.Router();


router.post('/upload-product',upload.single("image"),uploadProduct)
router.get('/get-product-by-id/:userId',getProductByUserId)
router.get('/get-product/:id', getProductById);
router.delete('/delete-product/:id',deleteProduct)
router.put('/update-product/:id', upload.single('image'), updateProduct);
router.get('/get-all-products',getAllProducts)
router.put('/update-product-status/:id',updateProductStatus)
router.get('/get-product-by-status',getProductByStatus)
router.post('/post-wish',postWish)
router.post('/post-cart',postCart)
router.get('/get-wish/:userId',getWish)
router.delete('/delete-wish/:wishId',deleteWish)
router.get('/get-cart/:userId',getCart)
router.delete('/delete-cart/:cartId',deleteCart)
router.put('/update-quantity/:cartId',updateQuantity)


module.exports = router;