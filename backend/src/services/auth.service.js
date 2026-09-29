import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import env from "../config/env.js";
import { sendPasswordResetEmail } from "./email.service.js";

const googleOAuthClient =
  new OAuth2Client();

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    preferences: user.preferences,
    privacy: user.privacy,
    addresses: user.addresses || [],
    createdAt: user.createdAt,
  };
};

const registerUser = async ({
  name,
  email,
  password,
}) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
    isEmailVerified: false,
    isActive: true,
  });

  const token = generateToken(
    user._id.toString(),
    user.role
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been disabled"
    );
  }

  const passwordMatched =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordMatched) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  const token = generateToken(
    user._id.toString(),
    user.role
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

const loginWithGoogle = async (credential) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new ApiError(
      503,
      "Google sign-in is not configured on this server"
    );
  }

  if (
    typeof credential !== "string" ||
    !credential
  ) {
    throw new ApiError(
      400,
      "A Google credential is required"
    );
  }

  let googleUser;

  try {
    const ticket =
      await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });

    googleUser = ticket.getPayload();
  } catch {
    throw new ApiError(
      401,
      "Google credential is invalid or expired"
    );
  }

  if (
    !googleUser?.sub ||
    !googleUser.email ||
    googleUser.email_verified !== true
  ) {
    throw new ApiError(
      401,
      "Google must provide a verified email address"
    );
  }

  const normalizedEmail =
    googleUser.email.trim().toLowerCase();

  let user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    try {
      user = await User.create({
        name:
          String(googleUser.name || normalizedEmail)
            .trim()
            .slice(0, 50),
        email: normalizedEmail,
        password: await bcrypt.hash(
          crypto.randomBytes(32).toString("hex"),
          12
        ),
        isEmailVerified: true,
        isActive: true,
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      user = await User.findOne({
        email: normalizedEmail,
      });
    }
  }

  if (!user) {
    throw new ApiError(
      500,
      "Unable to create or load the Google account"
    );
  }

  if (user.isActive === false) {
    throw new ApiError(
      403,
      "Your account has been disabled"
    );
  }

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  const token = generateToken(
    user._id.toString(),
    user.role
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

const getUserById = async (
  userId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return sanitizeUser(user);
};

const updateProfile = async (
  userId,
  data
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (data.name !== undefined) {
    if (
      data.name.trim().length < 2
    ) {
      throw new ApiError(
        400,
        "Name must contain at least 2 characters"
      );
    }

    user.name =
      data.name.trim();
  }

  if (data.phone !== undefined) {
    user.phone =
      data.phone.trim();
  }

  if (Array.isArray(data.addresses)) {
    user.addresses =
      data.addresses.map(
        (address) => ({
          label:
            address.label ||
            "Home",

          fullName:
            address.fullName || "",

          phone:
            address.phone || "",

          addressLine:
            address.addressLine || "",

          city:
            address.city || "",

          state:
            address.state || "",

          pincode:
            address.pincode || "",

          isDefault:
            Boolean(
              address.isDefault
            ),
        })
      );
  }

  await user.save();

  return sanitizeUser(user);
};

const updateSettings = async (
  userId,
  data
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (
    data.preferences &&
    typeof data.preferences === "object"
  ) {
    user.preferences = {
      ...user.preferences.toObject(),
      ...data.preferences,
    };
  }

  if (
    data.privacy &&
    typeof data.privacy === "object"
  ) {
    user.privacy = {
      ...user.privacy.toObject(),
      ...data.privacy,
    };
  }

  await user.save();

  return sanitizeUser(user);
};

const changePassword = async (
  userId,
  {
    currentPassword,
    newPassword,
  }
) => {
  if (
    !currentPassword ||
    !newPassword
  ) {
    throw new ApiError(
      400,
      "Current password and new password are required"
    );
  }

  if (
    newPassword.length < 8
  ) {
    throw new ApiError(
      400,
      "New password must contain at least 8 characters"
    );
  }

  const user =
    await User.findById(
      userId
    ).select("+password");

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  const matched =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!matched) {
    throw new ApiError(
      401,
      "Current password is incorrect"
    );
  }

  user.password =
    await bcrypt.hash(
      newPassword,
      12
    );

  await user.save();

  return true;
};

// ── Forgot Password ─────────────────────────────────────────────────────
// Pattern: generate a random raw token, email the RAW token to the user as
// a link, but store only its SHA-256 HASH in MongoDB. Even if the database
// leaked, the stored hash alone can't be used to reset anyone's password —
// only the raw token (which only the recipient's inbox has) hashes to it.
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes

const requestPasswordReset = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  // Always behave the same way whether or not the account exists — this
  // stops the endpoint being used to check which emails are registered.
  if (!user) {
    return {};
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    const result =
      await sendPasswordResetEmail(
        user.email,
        resetUrl
      );

    // No SMTP configured - the link was only written to the server
    // console. Return it here too so the frontend can show it
    // directly during local testing, the same way OTP codes are
    // echoed back in development.
    if (result?.devLogged) {
      return { devResetUrl: resetUrl };
    }

    return {};
  } catch (error) {
    // Don't leave a live, unusable token on the account if the email
    // never actually went out.
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    throw new ApiError(
      500,
      "Could not send the password reset email. Please try again shortly."
    );
  }
};

const resetPassword = async (rawToken, newPassword) => {
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(String(rawToken || ""))
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "This reset link is invalid or has expired");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return sanitizeUser(user);
};

export {
  registerUser,
  loginUser,
  loginWithGoogle,
  getUserById,
  updateProfile,
  updateSettings,
  changePassword,
  requestPasswordReset,
  resetPassword,
};