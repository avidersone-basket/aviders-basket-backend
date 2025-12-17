import express from "express";
import BasketItem from "../models/BasketItem.js";

const router = express.Router();

/**
 * ➕ ADD TO BASKET
 * POST /basket
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      email,
      productId,
      source,
      affiliateUrl,
      priceAtAdd,
      currency = "INR",
      frequency,
    } = req.body;

    if (!userId || !email || !productId || !frequency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔁 Calculate next run date
    const nextRunAt = calculateNextRun(frequency);

    const item = await BasketItem.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        email,
        productId,
        source,
        affiliateUrl,
        priceAtAdd,
        currency,
        frequency,
        nextRunAt,
        status: "active",
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      basketItem: item,
    });
  } catch (err) {
    console.error("❌ Add to basket error:", err);
    res.status(500).json({ message: "Failed to add to basket" });
  }
});

/**
 * 📦 GET USER BASKET
 * GET /basket?userId=xxx
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const items = await BasketItem.find({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    res.json({
      total: items.length,
      items,
    });
  } catch (err) {
    console.error("❌ Fetch basket error:", err);
    res.status(500).json({ message: "Failed to fetch basket" });
  }
});

/**
 * 🗑️ DELETE ITEM FROM BASKET
 * DELETE /basket
 */
router.delete("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId required" });
    }

    const result = await BasketItem.findOneAndDelete({
      userId,
      productId,
    });

    if (!result) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      success: true,
      message: "Item removed from basket",
    });
  } catch (err) {
    console.error("❌ Delete basket item error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

/**
 * 🧠 NEXT RUN CALCULATOR
 */
function calculateNextRun(freq) {
  const now = new Date();

  switch (freq.type) {
    case "weekly": {
      const d = new Date(now);
      const diff = (freq.dayOfWeek - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return d;
    }

    case "monthly": {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      d.setDate(Math.min(freq.dayOfMonth, 28));
      return d;
    }

    case "custom": {
      const d = new Date(now);
      d.setDate(d.getDate() + (freq.intervalDays || 30));
      return d;
    }

    case "buy_once":
    default:
      return now;
  }
}

export default router;
