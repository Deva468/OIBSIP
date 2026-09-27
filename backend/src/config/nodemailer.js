import nodemailer from "nodemailer";
import env from "./env.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure:
    process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const verifyMailer = async () => {
  try {
    await transporter.verify();

    console.log(
      "Nodemailer SMTP connection is ready."
    );
  } catch (error) {
    console.error(
      "Nodemailer connection failed:",
      error.message
    );
  }
};

export {
  transporter,
  verifyMailer,
};