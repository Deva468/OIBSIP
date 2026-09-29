import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,

  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/pizza_delivery",

  JWT_SECRET:
    process.env.JWT_SECRET ||
    "pizza_delivery_development_secret",

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",

  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID || "",

  CLIENT_URL:
    process.env.CLIENT_URL ||
    "http://localhost:5173",

  RAZORPAY_KEY_ID:
    process.env.RAZORPAY_KEY_ID || "",

  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || "",

  // SMTP config — used by services/email.service.js to actually send
  // password-reset emails (previously these were never read at all, which
  // is why email.service.js only ever logged to the console).
  SMTP_HOST:
    process.env.SMTP_HOST || "",

  SMTP_PORT:
    process.env.SMTP_PORT || 587,

  SMTP_USER:
    process.env.SMTP_USER || "",

  SMTP_PASS:
    process.env.SMTP_PASS || "",

  EMAIL_FROM:
    process.env.EMAIL_FROM || "",
};

export default env;
