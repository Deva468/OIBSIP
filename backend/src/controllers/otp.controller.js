import {
  generateOrderOtp,
  verifyOrderOtp,
} from "../services/otp.service.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

// Demo OTP display is controlled separately.
// Set DEMO_OTP=true in Render Environment Variables
// for your college/OIBSIP demo deployment.
const isDemoOtpEnabled =
  process.env.DEMO_OTP === "true";

const sendOrderOtp = asyncHandler(
  async (req, res) => {
    const { phone } = req.body;

    const indianMobileRegex =
      /^[6-9][0-9]{9}$/;

    if (
      !phone ||
      !indianMobileRegex.test(
        String(phone).trim()
      )
    ) {
      throw new ApiError(
        400,
        "Enter a valid 10-digit mobile number to receive an OTP"
      );
    }

    const { code, expiresInMinutes } =
      await generateOrderOtp(
        req.user.userId,
        phone.trim()
      );

    // OTP is always printed in the backend console
    // for debugging/demo purposes.
    console.log(
      `[OTP] ${phone} -> ${code} (expires in ${expiresInMinutes} min)`
    );

    logActivity({
      userId: req.user.userId,
      action: "otp_sent",
      entityType: "Order",
      metadata: { phone },
      req,
    });

    const responseData = {
      expiresInMinutes,
    };

    // IMPORTANT:
    // Only return the OTP when DEMO_OTP=true.
    // This allows the deployed demo to display the OTP
    // without changing NODE_ENV from production.
    if (isDemoOtpEnabled) {
      responseData.devOtp = code;
    }

    res.status(200).json(
      new ApiResponse(
        200,
        responseData,
        "OTP sent successfully"
      )
    );
  }
);

const verifyOrderOtpHandler = asyncHandler(
  async (req, res) => {
    const {
      phone,
      otp,
    } = req.body;

    if (!phone || !otp) {
      throw new ApiError(
        400,
        "phone and otp are required"
      );
    }

    await verifyOrderOtp(
      req.user.userId,
      phone.trim(),
      otp
    );

    logActivity({
      userId: req.user.userId,
      action: "otp_verified",
      entityType: "Order",
      metadata: { phone },
      req,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        { verified: true },
        "OTP verified successfully"
      )
    );
  }
);

export {
  sendOrderOtp,
  verifyOrderOtpHandler,
};