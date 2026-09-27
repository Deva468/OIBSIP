

import UserActivity from "../models/UserActivity.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

const createActivity = asyncHandler(async (req, res) => {
  const {
    action,
    entityType = "",
    entityId = "",
    metadata = {},
  } = req.body || {};

  if (!action) {
    return res.status(400).json(
      new ApiResponse(400, null, "Activity action is required")
    );
  }

  await logActivity({
    userId: req.user.userId || req.user.id,
    action,
    entityType,
    entityId,
    metadata,
    req,
  });

  return res.status(201).json(
    new ApiResponse(201, null, "Activity recorded successfully")
  );
});

const getMyActivities = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id;

  const activities = await UserActivity.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      { activities },
      "Activities fetched successfully"
    )
  );
});

export { createActivity, getMyActivities };
