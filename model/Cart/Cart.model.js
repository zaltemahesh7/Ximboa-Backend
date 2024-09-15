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
      type: mongoose.Schema.Types.ObjectId, // Using ObjectId for referencing User Model
      ref: "User", // Assuming there's a User model for easier population
      required: true,
    },
    items: [CartItemSchema], // Reuse the CartItemSchema here
    totalPrice: {
      type: Number,
      default: 0,
      required: true,
      min: 0, // Total price should never be negative
    },
    status: {
      type: String,
      enum: ["active", "purchased", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt` fields
  }
);

// Pre-save hook to calculate the total price before saving the cart
CartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
