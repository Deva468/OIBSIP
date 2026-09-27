import nodemailer from "nodemailer";
import env from "../config/env.js";

// PREVIOUSLY: this file only console.logged "Email queued for ..." and
// never actually sent anything — that's why forgot-password links (and any
// other email) never arrived. This now sends real email via SMTP using
// Nodemailer, using credentials from your .env file.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn(
      "⚠️  SMTP_HOST / SMTP_USER / SMTP_PASS are not set in .env — emails will be logged to the console instead of actually sent. See the setup instructions to fix this."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: Number(env.SMTP_PORT) === 465, // true for port 465, false for 587/25
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    // Fallback so local dev without SMTP configured doesn't crash — but
    // this means the email is NOT actually delivered anywhere.
    console.log(`[DEV — no SMTP configured] Email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    return { success: false, devLogged: true };
  }

  await activeTransporter.sendMail({
    from: env.EMAIL_FROM || env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { success: true };
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  await sendEmail({
    to: toEmail,
    subject: "Reset your password — Pizza Delivery",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your Pizza Delivery account password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#ff6b35;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link into your browser:<br />${resetUrl}</p>
        <p style="color:#888;font-size:13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email — your password will not change.</p>
      </div>
    `,
  });
};

export { sendEmail, sendPasswordResetEmail };
