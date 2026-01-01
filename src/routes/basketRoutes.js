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
import { triggerReminders } from "../controllers/notificationController.js";

const router = express.Router();

/**
 * ➕ ADD TO BASKET
 * POST /basket
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
 */
router.delete("/", removeFromBasket);

/**
 * 🔄 UPDATE ITEM STATUS
 * PUT /basket/status
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
 */
router.patch("/item/:id/quantity", updateQuantity);

/**
 * 🔔 TRIGGER REMINDERS (Manual trigger for testing)
 * POST /basket/notifications/remind
 */
router.post("/notifications/remind", triggerReminders);

export default router;
