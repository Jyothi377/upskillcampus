const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  qty: Number,
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: String,
  restaurant: String,
  restaurantId: Number,
  items: [orderItemSchema],
  address: {
    street: String,
    city: String,
    pincode: String,
  },
  payment: { type: String, enum: ["upi", "card", "cod"], default: "cod" },
  itemTotal: Number,
  deliveryFee: Number,
  taxes: Number,
  total: Number,
  status: {
    type: String,
    enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "placed"
  },
}, { timestamps: true });

// Auto-generate orderId
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = "QB" + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
