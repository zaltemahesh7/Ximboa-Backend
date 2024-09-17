const express = require("express");
const cartController = require("../../../controllers/Cart/cart.controller");
const { jwtAuthMiddleware } = require("../../../middleware/auth");

const router = express.Router();

// Add item to cart
router.post("/add", jwtAuthMiddleware, cartController.addToCart);

// Get all cart items
router.get("/", jwtAuthMiddleware, cartController.getAllCartItems);

// Remove item from cart
router.delete(
  "/remove/:productId",
  jwtAuthMiddleware,
  cartController.removeCartItem
);

module.exports = router;
