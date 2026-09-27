import express from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import pizzaRoutes from "./pizza.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminInventoryRoutes from "./admin.inventory.routes.js";
import adminOrderRoutes from "./admin.order.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/pizzas", pizzaRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin/inventory", adminInventoryRoutes);
router.use("/admin/orders", adminOrderRoutes);

export default router;
