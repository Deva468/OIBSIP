import UserActivity from "../models/UserActivity.js";

const logActivity = async ({
  userId,
  action,
  entityType = "",
  entityId = "",
  metadata = {},
  req = null,
}) => {
  if (!userId) {
    return null;
  }

  try {
    return await UserActivity.create({
      user: userId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress:
        req?.ip || "",
      userAgent:
        req?.get(
          "user-agent"
        ) || "",
    });
  } catch (error) {
    console.error(
      "Activity tracking failed:",
      error.message
    );

    return null;
  }
};

export default logActivity;