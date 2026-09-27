import cron from "node-cron";

import {
  checkLowStock,
} from "../services/lowStock.service.js";

const startLowStockCron = () => {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      try {
        const result =
          await checkLowStock();

        console.log(
          "Low stock check completed",
          result
        );
      } catch (error) {
        console.error(
          "Low stock check failed:",
          error.message
        );
      }
    }
  );

  console.log(
    "Low stock cron job started."
  );
};

export default startLowStockCron;