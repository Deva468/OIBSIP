import express from "express";

import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";

import validateRequest from "../middleware/validateRequest.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(validateRegister),
  register
);

router.post(
  "/login",
  validateRequest(validateLogin),
  login
);

router.get(
  "/me",
  authenticate,
  getMe
);

// Previously missing entirely — these two are what power the
// Forgot Password / Reset Password pages.
router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

export default router;
