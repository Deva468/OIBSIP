import {
  generateOrderOtp,
  verifyOrderOtp,
} from "../services/otp.service.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logActivity from "../services/activity.service.js";

const isDev =
  process.env.NODE_ENV !== "production";

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

    // There's no real SMS gateway wired up in this project, so the
    // OTP is written to the server console exactly like a real
    // provider's dashboard would show a delivery log. In development
    // only, it's also echoed back in the API response so you can
    // test the flow end-to-end without needing a paid SMS account -
    // this must never happen in production.
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

    res.status(200).json(
      new ApiResponse(
        200,
        {
          expiresInMinutes,
          // SECURITY: only ever present outside production. Real
          // deployments must remove this and rely solely on the SMS
          // provider actually delivering the code.
          devOtp: isDev
            ? code
            : undefined,
        },
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
