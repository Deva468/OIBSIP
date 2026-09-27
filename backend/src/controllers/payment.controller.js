import crypto from "crypto";
import Razorpay from "razorpay";

import Order from "../models/Order.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";
import logActivity from "../services/activity.service.js";

/*
-----------------------------------------------------------------------
Razorpay client
-----------------------------------------------------------------------
Built once, from the RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET pair in
.env. In test mode (keys that start with "rzp_test_"), Razorpay's own
Checkout popup lets you simulate cards, UPI and netbanking without
touching any real bank - nothing else needs to be "faked" for a demo.
-----------------------------------------------------------------------
*/

/*
-----------------------------------------------------------------------
getRazorpayClient
-----------------------------------------------------------------------
Built lazily (only when a payment route is actually hit) instead of
at module load time. The Razorpay SDK throws immediately if key_id is
missing, and building it at the top of this file would crash the
*entire* backend on startup for anyone who hasn't added their
Razorpay keys to .env yet - even people only testing Cash on
Delivery. Building it on demand keeps the rest of the app working
regardless.
-----------------------------------------------------------------------
*/

let cachedRazorpayClient = null;

const getRazorpayClient = () => {
  if (cachedRazorpayClient) {
    return cachedRazorpayClient;
  }

  cachedRazorpayClient = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });

  return cachedRazorpayClient;
};

/*
-----------------------------------------------------------------------
createPaymentOrder
-----------------------------------------------------------------------
Body: { orderId }
The order must already exist in MongoDB (created via POST /orders
with paymentMethod: "RAZORPAY") and belong to the logged-in user.
This opens a matching "order" on Razorpay's side and returns just
enough for the frontend to launch the Checkout popup - the secret
key never leaves the backend.
-----------------------------------------------------------------------
*/

const createPaymentOrder = asyncHandler(
  async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(
        400,
        "orderId is required"
      );
    }

    if (
      !env.RAZORPAY_KEY_ID ||
      !env.RAZORPAY_KEY_SECRET
    ) {
      throw new ApiError(
        500,
        "Razorpay keys are not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
      );
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    if (order.paymentStatus === "PAID") {
      throw new ApiError(
        400,
        "This order has already been paid for"
      );
    }

    // Razorpay wants the amount in the smallest currency unit -
    // paise for INR, so ₹499 becomes 49900.
    const amountInPaise = Math.round(
      order.totalAmount * 100
    );

    const razorpayOrder =
      await getRazorpayClient().orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          userId: req.user.userId,
        },
      });

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          razorpayOrderId:
            razorpayOrder.id,
          amount:
            razorpayOrder.amount,
          currency:
            razorpayOrder.currency,
          keyId: env.RAZORPAY_KEY_ID,
          orderId: order._id,
        },
        "Razorpay order created successfully"
      )
    );
  }
);

/*
-----------------------------------------------------------------------
verifyPayment
-----------------------------------------------------------------------
Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
Called by the frontend from the Razorpay Checkout `handler` callback
once the user finishes paying in the popup. The signature is an
HMAC-SHA256 of "razorpay_order_id|razorpay_payment_id" using the
Razorpay secret key - if it doesn't match, the payment details were
tampered with (or forged) and must be rejected.
-----------------------------------------------------------------------
*/

const verifyPayment = asyncHandler(
  async (req, res) => {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      throw new ApiError(
        400,
        "Missing payment verification fields"
      );
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.userId,
    });

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

    const isSignatureValid =
      expectedSignature ===
      razorpaySignature;

    if (!isSignatureValid) {
      order.paymentStatus = "FAILED";
      await order.save();

      logActivity({
        userId: req.user.userId,
        action: "payment_failed",
        entityType: "Order",
        entityId: order._id.toString(),
        metadata: {
          reason: "signature_mismatch",
        },
        req,
      });

      throw new ApiError(
        400,
        "Payment verification failed - signature mismatch"
      );
    }

    order.paymentStatus = "PAID";
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.orderStatus = "CONFIRMED";

    await order.save();

    logActivity({
      userId: req.user.userId,
      action: "payment_success",
      entityType: "Order",
      entityId: order._id.toString(),
      metadata: {
        totalAmount: order.totalAmount,
        razorpayPaymentId,
      },
      req,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        { order },
        "Payment verified successfully"
      )
    );
  }
);

export {
  createPaymentOrder,
  verifyPayment,
};
