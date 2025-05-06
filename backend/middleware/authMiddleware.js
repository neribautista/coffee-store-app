import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in HttpOnly cookie
  else if (req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }

  console.log("Authenticated user:", req.user);
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  const adminEmail = "fahrenheitcoffeeph@gmail.com";

  if (req.user && req.user.email === adminEmail) {
    next(); 
  } else {
    res.status(403); // Forbidden
    throw new Error("Access denied. Admins only.");
    
  }
});