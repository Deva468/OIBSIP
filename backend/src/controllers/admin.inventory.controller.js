import {
  getInventory,
  updateInventory,
  getPizzaInventory,
  updatePizzaStock,
} from "../services/inventory.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllInventory = asyncHandler(
  async (req, res) => {
    const inventory = await getInventory();

    res.status(200).json(
      new ApiResponse(
        200,
        { inventory },
        "Inventory fetched successfully"
      )
    );
  }
);

const updateStock = asyncHandler(
  async (req, res) => {
    const result = await updateInventory({
      ...req.body,
      performedBy: req.user.userId,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Inventory updated successfully"
      )
    );
  }
);

// ── Pizza-level inventory (Admin Inventory Manager page) ────────────────

const getAllPizzaInventory = asyncHandler(
  async (req, res) => {
    const result = await getPizzaInventory();

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Pizza inventory fetched successfully"
      )
    );
  }
);

const updatePizzaStockHandler = asyncHandler(
  async (req, res) => {
    const result = await updatePizzaStock({
      pizzaId: req.params.pizzaId,
      stock: req.body.stock,
      performedBy: req.user.userId,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Pizza stock updated successfully"
      )
    );
  }
);

export {
  getAllInventory,
  updateStock,
  getAllPizzaInventory,
  updatePizzaStockHandler,
};
