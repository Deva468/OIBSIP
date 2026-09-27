import Order from "../models/Order.js";

import {
  calculateOrderTotal,
} from "./pricing.service.js";

import { hasVerifiedOtpRecently } from "./otp.service.js";

import ApiError from "../utils/ApiError.js";
import { getIO } from "../config/socket.js";

const createOrder = async (
  userId,
  orderData
) => {
  const {
    items,
    deliveryAddress,
    paymentMethod = "COD",
  } = orderData;

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new ApiError(
      400,
      "Order must contain at least one item"
    );
  }

  if (!deliveryAddress) {
    throw new ApiError(
      400,
      "Delivery address is required"
    );
  }

  // Never trust the browser's HTML validation alone - anyone can
  // call this API directly. Re-check every required address field
  // here on the server too.
  const requiredAddressFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "pincode",
  ];

  for (const field of requiredAddressFields) {
    if (
      !deliveryAddress[field] ||
      !String(
        deliveryAddress[field]
      ).trim()
    ) {
      throw new ApiError(
        400,
        `Delivery address is missing "${field}"`
      );
    }
  }

  const indianMobileRegex =
    /^[6-9][0-9]{9}$/;

  if (
    !indianMobileRegex.test(
      String(
        deliveryAddress.phone
      ).trim()
    )
  ) {
    throw new ApiError(
      400,
      "Enter a valid 10-digit mobile number"
    );
  }

  const pincodeRegex =
    /^[1-9][0-9]{5}$/;

  if (
    !pincodeRegex.test(
      String(
        deliveryAddress.pincode
      ).trim()
    )
  ) {
    throw new ApiError(
      400,
      "Enter a valid 6-digit pincode"
    );
  }

  // The delivery phone number must have been OTP-verified within
  // the last few minutes - this can never be skipped just by
  // calling this API directly, since it's re-checked here on the
  // server rather than trusted from the client.
  const otpVerified =
    await hasVerifiedOtpRecently(
      userId,
      String(
        deliveryAddress.phone
      ).trim()
    );

  if (!otpVerified) {
    throw new ApiError(
      400,
      "Please verify your phone number with the OTP before placing the order"
    );
  }

  const pricing =
    calculateOrderTotal(items);

  const order = await Order.create({
    user: userId,
    items,
    deliveryAddress,
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    totalAmount: pricing.totalAmount,
    paymentMethod,
  });

  return order;
};

const getUserOrders = async (
  userId
) => {
  return Order.find({
    user: userId,
  })
    .populate("items.base")
    .populate("items.sauce")
    .populate("items.cheese")
    .populate("items.vegetables")
    .sort({ createdAt: -1 });
};

const getOrderById = async (
  orderId,
  userId
) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .populate("items.base")
    .populate("items.sauce")
    .populate("items.cheese")
    .populate("items.vegetables");

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  return order;
};

const getAllOrders = async () => {
  return Order.find()
    .populate(
      "user",
      "name email"
    )
    .sort({ createdAt: -1 });
};

const updateOrderStatus = async (
  orderId,
  status
) => {
  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new ApiError(
      400,
      "Invalid order status"
    );
  }

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  order.orderStatus = status;

  if (status === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  await order.save();

  // Real-time push: Admin changes status → MongoDB updated (above) →
  // Socket.IO event → user's browser updates immediately, no refresh needed.
  try {
    const io = getIO();
    const payload = {
      orderId: order._id.toString(),
      orderStatus: order.orderStatus,
      updatedAt: order.updatedAt,
    };

    // Room used by the single-order tracking page (OrderTracking.jsx)
    io.to(`order:${order._id.toString()}`).emit(
      "order:status-updated",
      payload
    );

    // Room used by the order LIST page (Orders.jsx) so it updates the
    // matching row even if the user isn't currently viewing that order's
    // tracking page.
    io.to(`user:${order.user.toString()}`).emit(
      "order:status-updated",
      payload
    );
  } catch (socketError) {
    // Never let a Socket.IO problem block the actual status update from
    // being saved — real-time push is a nice-to-have on top of the DB write,
    // not a requirement for it to succeed.
    console.error(
      "Failed to emit order:status-updated:",
      socketError.message
    );
  }

  return order;
};

export {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};