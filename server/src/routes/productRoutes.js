const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const { uploadImage } = require('../services/storageService');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });


// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

// POST /api/products/:id/duplicate - Duplicate product
router.post('/:id/duplicate', productController.duplicateProduct);

// POST /api/products/upload-image - Upload product image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

module.exports = router;
