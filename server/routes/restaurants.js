const express = require("express");
const router = express.Router();

// Static restaurant data (same as frontend)
const restaurants = [
  { id: 1, name: "Spice Garden", cuisine: "Indian", rating: 4.5, deliveryTime: "30-40 min", deliveryFee: 0, minOrder: 149, isOpen: true },
  { id: 2, name: "Burger Barn", cuisine: "American", rating: 4.2, deliveryTime: "20-30 min", deliveryFee: 29, minOrder: 99, isOpen: true },
  { id: 3, name: "Pizza Palace", cuisine: "Italian", rating: 4.7, deliveryTime: "35-45 min", deliveryFee: 0, minOrder: 199, isOpen: true },
  { id: 4, name: "Wok & Roll", cuisine: "Chinese", rating: 4.3, deliveryTime: "25-35 min", deliveryFee: 19, minOrder: 129, isOpen: false },
  { id: 5, name: "South Bites", cuisine: "South Indian", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: 0, minOrder: 79, isOpen: true },
  { id: 6, name: "Wrap Republic", cuisine: "Mexican", rating: 4.1, deliveryTime: "15-25 min", deliveryFee: 39, minOrder: 149, isOpen: true },
];

// GET /api/restaurants
router.get("/", (req, res) => {
  const { cuisine, search } = req.query;
  let result = restaurants;
  if (cuisine && cuisine !== "All") result = result.filter(r => r.cuisine === cuisine);
  if (search) result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase()));
  res.json(result);
});

// GET /api/restaurants/:id
router.get("/:id", (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
});

module.exports = router;
