import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "LOW_STOCK",
        "ORDER",
        "PAYMENT",
        "SYSTEM",
      ],
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationLog = mongoose.model(
  "NotificationLog",
  notificationLogSchema
);

export default NotificationLog;