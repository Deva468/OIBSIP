import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import {
  getOrders,
  changeOrderStatus,
} from "../controllers/admin.order.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get(
  "/",
  getOrders
);

router.patch(
  "/:orderId/status",
  changeOrderStatus
);

export default router;