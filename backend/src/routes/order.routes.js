import express from "express";

import authenticate from "../middleware/authenticate.js";

import {
  create,
  getMyOrders,
  getSingleOrder,
} from "../controllers/order.controller.js";

import {
  sendOrderOtp,
  verifyOrderOtpHandler,
} from "../controllers/otp.controller.js";

const router = express.Router();

router.use(authenticate);

// OTP verification must happen before an order can be created - see
// otp.service.js / order.service.js for the enforcement.
router.post("/send-otp", sendOrderOtp);
router.post("/verify-otp", verifyOrderOtpHandler);

router.post("/", create);

router.get("/", getMyOrders);

router.get(
  "/:orderId",
  getSingleOrder
);

export default router;
