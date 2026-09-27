import {
  getAllOrders,
  updateOrderStatus,
} from "../services/order.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getOrders = asyncHandler(
  async (req, res) => {
    const orders = await getAllOrders();

    res.status(200).json(
      new ApiResponse(
        200,
        { orders },
        "All orders fetched successfully"
      )
    );
  }
);

const changeOrderStatus = asyncHandler(
  async (req, res) => {
    const order =
      await updateOrderStatus(
        req.params.orderId,
        req.body.status
      );

    res.status(200).json(
      new ApiResponse(
        200,
        { order },
        "Order status updated successfully"
      )
    );
  }
);

export {
  getOrders,
  changeOrderStatus,
};