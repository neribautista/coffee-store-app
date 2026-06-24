import Order from "../models/order.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items, totalPrice, paymentMethod, fulfillmentMethod, deliveryAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  if (fulfillmentMethod === "Delivery" && !deliveryAddress) {
    res.status(400);
    throw new Error("Delivery address is required for delivery orders");
  }

  const order = new Order({
    user: req.user._id,
    items,
    totalPrice,
    paymentMethod,
    fulfillmentMethod,
    deliveryAddress: fulfillmentMethod === "Delivery" ? deliveryAddress : "",
  });

  const createdOrder = await order.save();
  res.status(201).json({ success: true, data: createdOrder });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "first_name last_name email")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

// @desc    Update order status and/or tracking link (Admin)
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (req.body.status !== undefined) {
    order.status = req.body.status;
  }

  // NEW: lets the admin paste/update a Grab/Lalamove tracking link
  // independently of (or alongside) a status change.
  if (req.body.trackingUrl !== undefined) {
    order.trackingUrl = req.body.trackingUrl;
  }

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, data: updatedOrder });
});