import express from 'express';
import { registerUser, loginUser, getMe, refreshAccessToken, logoutUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';



const router = express.Router();

// Public routes
router.post('/', registerUser); 
router.post('/login', loginUser); 
router.post('/refresh', refreshAccessToken); 
router.post('/logout', logoutUser);

// Private route
router.get('/me', protect, getMe); 

export default router;