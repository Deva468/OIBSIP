import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app =
  express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// Health Check
app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Pizza Delivery API is running",
      timestamp:
        new Date().toISOString(),
    });
  }
);

// API Routes
app.use(
  "/api",
  routes
);

// 404
app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// Error Handler
app.use(
  errorHandler
);

export default app;