import express from "express";
import {
  addToBasket,
  getUserBasket,
  removeFromBasket,
  updateItemStatus,
  getDueItems,
} from "../controllers/basketController.js";

const router = express.Router();

/**
 * ➕ ADD TO BASKET
 * POST /basket
 * 
 * Body: { userId, email, productId, source, affiliateUrl, priceAtAdd, currency, frequency }
 */
router.post("/", addToBasket);

/**
 * 📦 GET USER BASKET
 * GET /basket?userId=xxx
 */
router.get("/", getUserBasket);

/**
 * 🗑️ DELETE ITEM FROM BASKET
 * DELETE /basket
 * 
 * Body: { userId, productId }
 */
router.delete("/", removeFromBasket);

/**
 * 🔄 UPDATE ITEM STATUS
 * PUT /basket/status
 * 
 * Body: { userId, productId, status: "active" | "paused" | "cancelled" }
 */
router.put("/status", updateItemStatus);

/**
 * ⏰ GET DUE ITEMS (for scheduled purchases)
 * GET /basket/due
 */
router.get("/due", getDueItems);

export default router;
