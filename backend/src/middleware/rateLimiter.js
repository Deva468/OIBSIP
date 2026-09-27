

import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      "Too many authentication requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default authRateLimiter;

