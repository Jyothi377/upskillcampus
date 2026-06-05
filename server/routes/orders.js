const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

const JWT_SECRET = process.env.JWT_SECRET || "quickbite_secret_key_2024";

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// POST /api/orders — Place new order
router.post("/", auth, async (req, res) => {
  try {
    const { items, restaurant, restaurantId, address, payment, itemTotal, deliveryFee, taxes, total } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const order = await Order.create({
      user: req.user.id,
      userEmail: req.user.email,
      items, restaurant, restaurantId, address,
      payment, itemTotal, deliveryFee, taxes, total,
      status: "placed"
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders/my — Get current user's orders
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/orders/:id — Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /api/orders/:id/status — Update order status (restaurant owner / delivery)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findOneAndUpdate({ orderId: req.params.id }, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
