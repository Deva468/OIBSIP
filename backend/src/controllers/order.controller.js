import {
  createOrder,
  getUserOrders,
  getOrderById,
} from "../services/order.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

const create = asyncHandler(async (req, res) => {
  const order = await createOrder(
    req.user.userId,
    req.body
  );

  logActivity({
    userId: req.user.userId,
    action: "order_placed",
    entityType: "Order",
    entityId: order._id.toString(),
    metadata: {
      totalAmount: order.totalAmount,
      itemsCount: order.items?.length || 0,
      paymentMethod: order.paymentMethod,
    },
    req,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      { order },
      "Order created successfully"
    )
  );
});

const getMyOrders = asyncHandler(
  async (req, res) => {
    const orders = await getUserOrders(
      req.user.userId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        { orders },
        "Orders fetched successfully"
      )
    );
  }
);

const getSingleOrder = asyncHandler(
  async (req, res) => {
    const order = await getOrderById(
      req.params.orderId,
      req.user.userId
    );

    res.status(200).json(
      new ApiResponse(
        200,
        { order },
        "Order fetched successfully"
      )
    );
  }
);

export {
  create,
  getMyOrders,
  getSingleOrder,
};