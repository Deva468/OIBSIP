import mongoose from "mongoose";

/*
-----------------------------------------------------------------------
OtpToken
-----------------------------------------------------------------------
Short-lived, single-use codes used to confirm that the person placing
an order really controls the phone number in the delivery address,
before the order is created. This is an extra layer on top of the
JWT session itself - even if a session/device were ever compromised,
placing a real order still requires the current OTP sent to that
phone number.

The code itself is never stored in plain text (bcrypt hash only), and
the `expiresAt` TTL index means MongoDB automatically deletes expired
documents on its own - nothing to clean up manually.
-----------------------------------------------------------------------
*/

const otpTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["ORDER_PLACEMENT"],
      default: "ORDER_PLACEMENT",
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    consumed: {
      type: Boolean,
      default: false,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - MongoDB automatically deletes the document once
// `expiresAt` is in the past, so unused/expired OTPs never pile up.
otpTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OtpToken = mongoose.model(
  "OtpToken",
  otpTokenSchema
);

export default OtpToken;
