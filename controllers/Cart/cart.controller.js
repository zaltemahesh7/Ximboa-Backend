const Product = require("../../model/product");
const NotificationModel = require("../../model/Notifications/Notification.model");
const CartModel = require("../../model/Cart/Cart.model");
const { ApiError } = require("../../utils/ApiError");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userId = req.user.id;

    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      cart = new CartModel({
        userId,
        items: [
          {
            productId,
            quantity,
            price: product.product_selling_prize,
          },
        ],
      });
    } else {
      const existingProductIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingProductIndex >= 0) {
        cart.items[existingProductIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.product_selling_prize,
        });
      }
    }

    await cart.save();

    const notification = new NotificationModel({
      recipient: userId,
      message: `The product "${product.product_name}" has been added to your cart.`,
      activityType: "CART_ITEM_ADDED",
      relatedId: productId,
    });

    await notification.save();

    return res.status(200).json({
      message: "Product added to cart successfully",
      // cart,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
};

// Get all cart items controller
const getAllCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await CartModel.findOne({ userId }).populate(
      "items.productId",
      "product_name price product_image"
    );

    if (!cart) {
      return res.status(200).json({
        message: "No items in cart",
        items: [],
      });
    }
    const baseUrl = req.protocol + "://" + req.get("host");

    return res.status(200).json({
      message: "Cart items fetched successfully",
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.product_name,
        quantity: item.quantity,
        productPrice: item.price,
        productTotalPrice: item.price * item.quantity,
        productImage: `${baseUrl}/${item.productId.product_image.replace(
          /\\/g,
          "/"
        )}`,
      })),
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found for this user.",
      });
    }

    const updatedItems = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (updatedItems.length === cart.items.length) {
      return res.status(404).json({
        message: "Item not found in cart.",
      });
    }

    cart.items = updatedItems;
    await cart.save();

    const notification = new NotificationModel({
      recipient: userId,
      message: `Item with product ID ${productId} has been removed from your cart.`,
      activityType: "CART_ITEM_REMOVED",
      relatedId: productId,
    });

    await notification.save();

    return res.status(200).json({
      message: "Item removed from cart successfully.",
      cart: cart.items,
    });
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error.message || "Server error", error));
  }
};

module.exports = {
  addToCart,
  getAllCartItems,
  removeCartItem,
};
