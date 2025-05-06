import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads')); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const upload = multer({ storage });

// Product Routes
router.get('/', getProducts);
// Admin-only routes
router.post("/", protect, isAdmin, createProduct); 
router.put("/:id", protect, isAdmin, updateProduct); 
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;