import PizzaBase from "../models/PizzaBase.js";
import Sauce from "../models/Sauce.js";
import Cheese from "../models/Cheese.js";
import Vegetable from "../models/Vegetable.js";

const checkLowStock = async () => {
  const results = [];

  const models = [
    {
      model: PizzaBase,
      type: "PizzaBase",
    },
    {
      model: Sauce,
      type: "Sauce",
    },
    {
      model: Cheese,
      type: "Cheese",
    },
    {
      model: Vegetable,
      type: "Vegetable",
    },
  ];

  for (const item of models) {
    const lowStockItems =
      await item.model.find({
        $expr: {
          $lte: [
            "$stock",
            "$lowStockThreshold",
          ],
        },
      });

    results.push({
      type: item.type,
      items: lowStockItems,
    });
  }

  return results;
};

export {
  checkLowStock,
};