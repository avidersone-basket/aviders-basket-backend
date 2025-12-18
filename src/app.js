import express from "express";
import cors from "cors";
import basketRoutes from "./routes/basketRoutes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Aviders Basket API Live",
    version: "2.0.0",
    endpoints: {
      addToBasket: "POST /basket",
      getUserBasket: "GET /basket?userId={userId}",
      removeFromBasket: "DELETE /basket",
      updateItemStatus: "PUT /basket/status",
      getDueItems: "GET /basket/due",
      checkout: "POST /basket/checkout",
      getDueScheduled: "GET /basket/scheduled/due",
    },
  });
});

// Routes
app.use("/basket", basketRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
