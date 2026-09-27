
import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
  getMe,
  updateUserProfile,
  updateUserSettings,
  updateUserPassword,
} from "../controllers/auth.controller.js";

import {
  createActivity,
  getMyActivities,
} from "../controllers/activity.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getMe);
router.patch("/profile", updateUserProfile);
router.patch("/settings", updateUserSettings);
router.patch("/password", updateUserPassword);

router.post("/activity", createActivity);
router.get("/activity", getMyActivities);

export default router;
