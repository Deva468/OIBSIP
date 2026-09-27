import crypto from "crypto";
import bcrypt from "bcryptjs";

import OtpToken from "../models/OtpToken.js";
import ApiError from "../utils/ApiError.js";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 30;

/*
-----------------------------------------------------------------------
generateOrderOtp
-----------------------------------------------------------------------
Creates a fresh 6-digit code for (userId, phone), invalidates any
older unconsumed code for the same pair, and returns the plain code
exactly once so the caller can "send" it. Only the bcrypt hash is
ever persisted.

`crypto.randomInt` (not Math.random) is used because it's
cryptographically secure - Math.random() is predictable enough that
it should never be used to generate anything security-sensitive like
an OTP.
-----------------------------------------------------------------------
*/

const generateOrderOtp = async (
  userId,
  phone
) => {
  const recentToken =
    await OtpToken.findOne({
      user: userId,
      phone,
      consumed: false,
      expiresAt: {
        $gt: new Date(),
      },
    }).sort({ createdAt: -1 });

  if (recentToken) {
    const secondsSinceCreated =
      (Date.now() -
        recentToken.createdAt.getTime()) /
      1000;

    if (
      secondsSinceCreated <
      RESEND_COOLDOWN_SECONDS
    ) {
      throw new ApiError(
        429,
        `Please wait ${Math.ceil(
          RESEND_COOLDOWN_SECONDS -
            secondsSinceCreated
        )}s before requesting another OTP`
      );
    }
  }

  // Invalidate any older, still-active codes for this phone so only
  // the most recently sent OTP can ever be used.
  await OtpToken.updateMany(
    {
      user: userId,
      phone,
      consumed: false,
    },
    {
      consumed: true,
    }
  );

  const code = crypto
    .randomInt(0, 1000000)
    .toString()
    .padStart(OTP_LENGTH, "0");

  const codeHash = await bcrypt.hash(
    code,
    10
  );

  await OtpToken.create({
    user: userId,
    phone,
    codeHash,
    expiresAt: new Date(
      Date.now() +
        OTP_TTL_MINUTES * 60 * 1000
    ),
  });

  return {
    code,
    expiresInMinutes: OTP_TTL_MINUTES,
  };
};

/*
-----------------------------------------------------------------------
verifyOrderOtp
-----------------------------------------------------------------------
Checks the submitted code against the most recent unconsumed,
unexpired token for (userId, phone). Each wrong guess counts against
`maxAttempts` so the code can't be brute-forced (a 6-digit code has a
million combinations, but 5 tries at 10-minute expiry makes that
practically impossible anyway).
-----------------------------------------------------------------------
*/

const verifyOrderOtp = async (
  userId,
  phone,
  submittedCode
) => {
  const token = await OtpToken.findOne({
    user: userId,
    phone,
    consumed: false,
    expiresAt: {
      $gt: new Date(),
    },
  }).sort({ createdAt: -1 });

  if (!token) {
    throw new ApiError(
      400,
      "OTP has expired or was not requested. Please request a new one."
    );
  }

  if (token.attempts >= token.maxAttempts) {
    token.consumed = true;
    await token.save();

    throw new ApiError(
      429,
      "Too many incorrect attempts. Please request a new OTP."
    );
  }

  const isMatch = await bcrypt.compare(
    String(submittedCode || ""),
    token.codeHash
  );

  if (!isMatch) {
    token.attempts += 1;
    await token.save();

    throw new ApiError(
      400,
      `Incorrect OTP. ${
        token.maxAttempts -
        token.attempts
      } attempt(s) left.`
    );
  }

  token.consumed = true;
  token.consumedAt = new Date();
  await token.save();

  return true;
};

/*
-----------------------------------------------------------------------
hasVerifiedOtpRecently
-----------------------------------------------------------------------
Used by order creation to confirm the phone number on this order was
actually OTP-verified a few minutes ago, instead of trusting the
frontend to have called verify first.
-----------------------------------------------------------------------
*/

const hasVerifiedOtpRecently = async (
  userId,
  phone
) => {
  const verifiedWithinMinutes = 15;

  const token = await OtpToken.findOne({
    user: userId,
    phone,
    consumed: true,
    consumedAt: {
      $gt: new Date(
        Date.now() -
          verifiedWithinMinutes *
            60 *
            1000
      ),
    },
  }).sort({ consumedAt: -1 });

  return Boolean(token);
};

export {
  generateOrderOtp,
  verifyOrderOtp,
  hasVerifiedOtpRecently,
};
