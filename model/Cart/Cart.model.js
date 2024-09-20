const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1."],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    items: [CartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "purchased", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
