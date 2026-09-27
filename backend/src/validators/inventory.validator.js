import ApiError from "../utils/ApiError.js";

const validateInventoryUpdate = (req) => {
  const {
    itemType,
    itemId,
    quantity,
    action,
  } = req.body;

  if (
    !itemType ||
    !itemId ||
    quantity === undefined ||
    !action
  ) {
    throw new ApiError(
      400,
      "itemType, itemId, quantity and action are required"
    );
  }

  if (
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) < 0
  ) {
    throw new ApiError(
      400,
      "Quantity must be a valid positive number"
    );
  }
};

export {
  validateInventoryUpdate,
};