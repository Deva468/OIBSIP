
import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import initializeSocket from "./config/socket.js";
import startLowStockCron from "./jobs/lowStockCron.js";
import setupOrderSocket from "./sockets/orderSocket.js";

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const io =
      initializeSocket(httpServer);

    setupOrderSocket(io);

    httpServer.listen(
      env.PORT,
      () => {
        console.log(
          `Server running on http://localhost:${env.PORT}`
        );

        startLowStockCron();
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();