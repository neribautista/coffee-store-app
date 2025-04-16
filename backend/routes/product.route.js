import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/product.controller.js'; // Import deleteProduct

const router = express.Router();

//User Routes


//Product Routes
router.get('/', getProducts);
router.post('/', createProduct); 
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct); 



export default router;