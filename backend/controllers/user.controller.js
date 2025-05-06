import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

// User Controllers


// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token: generateAccessToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "1d", 
    });

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict", 
      maxAge: 23 * 60 * 60 * 1000, // 23 hours
    });

    // Send the access token and user details to the client
    res.json({
      token: accessToken,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const { _id, first_name, last_name, email } = req.user;
  res.status(200).json({
    id: _id,
    first_name,
    last_name,
    email,
  });
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Generate a new access token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30m", 
  });
};


// Refresh Token Endpoint
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken; 

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate a new access token
    const accessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken }); 
  } catch (error) {
    console.error("Error verifying refresh token:", error.message);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});