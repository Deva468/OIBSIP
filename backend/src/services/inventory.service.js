import PizzaBase from "../models/PizzaBase.js";
import Sauce from "../models/Sauce.js";
import Cheese from "../models/Cheese.js";
import Vegetable from "../models/Vegetable.js";
import InventoryLog from "../models/InventoryLog.js";
import PizzaTemplate from "../models/PizzaTemplate.js";

import ApiError from "../utils/ApiError.js";

const models = {
  PizzaBase,
  Sauce,
  Cheese,
  Vegetable,
};

const getInventory = async () => {
  const [
    bases,
    sauces,
    cheeses,
    vegetables,
  ] = await Promise.all([
    PizzaBase.find(),
    Sauce.find(),
    Cheese.find(),
    Vegetable.find(),
  ]);

  return {
    bases,
    sauces,
    cheeses,
    vegetables,
  };
};

const updateInventory = async ({
  itemType,
  itemId,
  quantity,
  action,
  reason,
  performedBy,
}) => {
  const Model = models[itemType];

  if (!Model) {
    throw new ApiError(
      400,
      "Invalid inventory item type"
    );
  }

  const item = await Model.findById(itemId);

  if (!item) {
    throw new ApiError(
      404,
      "Inventory item not found"
    );
  }

  const previousStock = item.stock;

  let newStock;

  if (
    action === "ADD" ||
    action === "RESTOCK"
  ) {
    newStock =
      previousStock + quantity;
  } else if (
    action === "REMOVE" ||
    action === "ORDER_DEDUCTION"
  ) {
    newStock =
      previousStock - quantity;

    if (newStock < 0) {
      throw new ApiError(
        400,
        "Insufficient stock"
      );
    }
  } else if (action === "ADJUSTMENT") {
    newStock = quantity;
  } else {
    throw new ApiError(
      400,
      "Invalid inventory action"
    );
  }

  item.stock = newStock;

  if (newStock === 0) {
    item.isAvailable = false;
  } else if (newStock > 0) {
    item.isAvailable = true;
  }

  await item.save();

  await InventoryLog.create({
    itemType,
    itemId,
    action,
    quantity,
    previousStock,
    newStock,
    reason,
    performedBy,
  });

  return {
    item,
    previousStock,
    newStock,
  };
};

// ── Pizza-level inventory (for the Admin Inventory Manager page) ──────────
// This is separate from the raw ingredient inventory above: it tracks a
// finished-pizza stock count directly on PizzaTemplate, which is what the
// admin table (Pizza Name | Category | Price | Stock | Status | Action)
// reads and edits.

const getPizzaInventory = async () => {
  const pizzas = await PizzaTemplate.find().sort({ name: 1 });

  const totalProducts = pizzas.length;
  const lowStock = pizzas.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outOfStock = pizzas.filter((p) => p.stock === 0).length;
  const totalStockValue = pizzas.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  return {
    pizzas,
    stats: {
      totalProducts,
      lowStock,
      outOfStock,
      totalStockValue,
    },
  };
};

const updatePizzaStock = async ({ pizzaId, stock, performedBy }) => {
  if (stock === undefined || stock === null || Number(stock) < 0) {
    throw new ApiError(400, "A valid, non-negative stock value is required");
  }

  const pizza = await PizzaTemplate.findById(pizzaId);
  if (!pizza) {
    throw new ApiError(404, "Pizza not found");
  }

  const previousStock = pizza.stock;
  pizza.stock = Number(stock);
  pizza.isAvailable = pizza.stock > 0;
  await pizza.save();

  await InventoryLog.create({
    itemType: "PizzaTemplate",
    itemId: pizzaId,
    action: "ADJUSTMENT",
    quantity: pizza.stock,
    previousStock,
    newStock: pizza.stock,
    reason: "Admin manual stock update",
    performedBy,
  });

  return { pizza, previousStock, newStock: pizza.stock };
};

export {
  getInventory,
  updateInventory,
  getPizzaInventory,
  updatePizzaStock,
};