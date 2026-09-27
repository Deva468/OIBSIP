import {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  updateSettings,
  changePassword,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "../services/auth.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

const register = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      password,
    } = req.body;

    const result =
      await registerUser({
        name,
        email,
        password,
      });

    // Fire-and-forget activity log so a slow/failed write to the
    // activity collection never blocks the register response.
    logActivity({
      userId: result.user.id,
      action: "register",
      entityType: "User",
      entityId: result.user.id?.toString?.() || "",
      metadata: {
        email: result.user.email,
      },
      req,
    });

    res.status(201).json(
      new ApiResponse(
        201,
        result,
        "Account created successfully"
      )
    );
  }
);

const login = asyncHandler(
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    const result =
      await loginUser({
        email,
        password,
      });

    logActivity({
      userId: result.user.id,
      action: "login",
      entityType: "User",
      entityId: result.user.id?.toString?.() || "",
      metadata: {
        email: result.user.email,
      },
      req,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        result,
        "Login successful"
      )
    );
  }
);

const getMe = asyncHandler(
  async (req, res) => {
    const user =
      await getUserById(
        req.user.userId
      );

    res.status(200).json(
      new ApiResponse(
        200,
        { user },
        "User fetched successfully"
      )
    );
  }
);

const updateUserProfile =
  asyncHandler(
    async (req, res) => {
      const user =
        await updateProfile(
          req.user.userId,
          req.body
        );

      logActivity({
        userId: req.user.userId,
        action: "profile_updated",
        entityType: "User",
        entityId: req.user.userId,
        metadata: {
          fields: Object.keys(
            req.body || {}
          ),
        },
        req,
      });

      res.status(200).json(
        new ApiResponse(
          200,
          { user },
          "Profile updated successfully"
        )
      );
    }
  );

const updateUserSettings =
  asyncHandler(
    async (req, res) => {
      const user =
        await updateSettings(
          req.user.userId,
          req.body
        );

      logActivity({
        userId: req.user.userId,
        action: "settings_updated",
        entityType: "User",
        entityId: req.user.userId,
        metadata: {
          fields: Object.keys(
            req.body || {}
          ),
        },
        req,
      });

      res.status(200).json(
        new ApiResponse(
          200,
          { user },
          "Settings updated successfully"
        )
      );
    }
  );

const updateUserPassword =
  asyncHandler(
    async (req, res) => {
      await changePassword(
        req.user.userId,
        req.body
      );

      logActivity({
        userId: req.user.userId,
        action: "password_changed",
        entityType: "User",
        entityId: req.user.userId,
        req,
      });

      res.status(200).json(
        new ApiResponse(
          200,
          null,
          "Password changed successfully"
        )
      );
    }
  );

const forgotPassword = asyncHandler(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email is required")
      );
    }

    const result =
      await requestPasswordReset(email);

    // Always return the SAME message whether or not the account exists —
    // this stops the endpoint being used to check which emails are
    // registered on the site.
    res.status(200).json(
      new ApiResponse(
        200,
        {
          // Only ever present when no SMTP is configured (local
          // dev). Real deployments with SMTP set never send this -
          // the link only ever goes out over email.
          devResetUrl:
            result?.devResetUrl,
        },
        "If an account with that email exists, a password reset link has been sent."
      )
    );
  }
);

const resetPassword = asyncHandler(
  async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await resetPasswordService(token, password);

    logActivity({
      userId: user.id,
      action: "password_reset",
      entityType: "User",
      entityId: user.id?.toString?.() || "",
      req,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Password reset successful. You can now log in with your new password."
      )
    );
  }
);

export {
  register,
  login,
  getMe,
  updateUserProfile,
  updateUserSettings,
  updateUserPassword,
  forgotPassword,
  resetPassword,
};