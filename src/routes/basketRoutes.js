import express from "express";
import {
  addToBasket,
  getUserBasket,
  removeFromBasket,
  updateItemStatus,
  getDueItems,
  updateSchedule,
  pauseItem,
  resumeItem,
  updateQuantity,
} from "../controllers/basketController.js";
import {
  checkoutBasket,
  getDueScheduledItems,
} from "../controllers/checkoutController.js";

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

/**
 * 🛒 CHECKOUT BASKET
 * POST /basket/checkout
 * 
 * Body: { userId, selectedProductIds?: [] }
 * Returns: { wishlistUrl, summary: { quickBuy, scheduled } }
 */
router.post("/checkout", checkoutBasket);

/**
 * 📅 GET DUE SCHEDULED ITEMS (for cron)
 * GET /basket/scheduled/due
 */
router.get("/scheduled/due", getDueScheduledItems);

/**
 * ✏️ UPDATE SCHEDULE
 * PATCH /basket/item/:itemId
 * 
 * Body: { frequency: { type, dayOfWeek?, dayOfMonth?, intervalDays? } }
 */
router.patch("/item/:itemId", updateSchedule);

/**
 * ⏸️ PAUSE ITEM
 * PATCH /basket/item/:id/pause
 */
router.patch("/item/:id/pause", pauseItem);

/**
 * ▶️ RESUME ITEM
 * PATCH /basket/item/:id/resume
 */
router.patch("/item/:id/resume", resumeItem);

/**
 * 🔢 UPDATE QUANTITY
 * PATCH /basket/item/:id/quantity
 * 
 * Body: { quantity: number }
 */
router.patch("/item/:id/quantity", updateQuantity);

export default router;
