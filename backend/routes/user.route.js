import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';



const router = express.Router();

// Public routes
router.post('/', registerUser); 
router.post('/login', loginUser); 

// Private route
router.get('/me', protect, getMe); 

export default router;