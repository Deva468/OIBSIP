import express from "express";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

import {
  getAllInventory,
  updateStock,
  getAllPizzaInventory,
  updatePizzaStockHandler,
} from "../controllers/admin.inventory.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

// Raw ingredient inventory (bases/sauces/cheeses/vegetables)
router.get(
  "/",
  getAllInventory
);

router.patch(
  "/",
  updateStock
);

// Finished-pizza inventory — used by the Admin Inventory Manager page
router.get(
  "/pizzas",
  getAllPizzaInventory
);

router.patch(
  "/pizzas/:pizzaId",
  updatePizzaStockHandler
);

export default router;
