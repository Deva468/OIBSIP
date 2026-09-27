import ApiError from "../utils/ApiError.js";

const validateCreateOrder = (req) => {
  const {
    items,
    deliveryAddress,
  } = req.body;

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new ApiError(
      400,
      "At least one order item is required"
    );
  }

  if (!deliveryAddress) {
    throw new ApiError(
      400,
      "Delivery address is required"
    );
  }
};

export {
  validateCreateOrder,
};