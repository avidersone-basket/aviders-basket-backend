import BasketItem from "../models/BasketItem.js";

/**
 * Calculate next run date based on frequency configuration
 */
export function calculateNextRun(freq) {
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

/**
 * Add or update item in basket
 */
export async function addToBasket(req, res) {
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

    // Validation
    if (!userId || !email || !productId || !frequency) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: userId, email, productId, frequency" 
      });
    }

    if (!["weekly", "monthly", "custom", "buy_once"].includes(frequency.type)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid frequency type" 
      });
    }

    // Calculate next run date
    const nextRunAt = calculateNextRun(frequency);

    // Upsert basket item
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

    console.log(`✅ Added to basket: ${productId} for user ${userId}`);

    res.json({
      success: true,
      basketItem: item,
      message: "Item added to basket successfully",
    });
  } catch (err) {
    console.error("❌ Add to basket error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to add to basket",
      error: err.message 
    });
  }
}

/**
 * Get user's basket
 */
export async function getUserBasket(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "userId parameter is required" 
      });
    }

    const items = await BasketItem.find({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    console.log(`📦 Fetched ${items.length} basket items for user ${userId}`);

    res.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (err) {
    console.error("❌ Fetch basket error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch basket",
      error: err.message 
    });
  }
}

/**
 * Remove item from basket
 */
export async function removeFromBasket(req, res) {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false,
        message: "userId and productId are required" 
      });
    }

    const result = await BasketItem.findOneAndDelete({
      userId,
      productId,
    });

    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: "Item not found in basket" 
      });
    }

    console.log(`🗑️ Removed from basket: ${productId} for user ${userId}`);

    res.json({
      success: true,
      message: "Item removed from basket successfully",
    });
  } catch (err) {
    console.error("❌ Delete basket item error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to remove item",
      error: err.message 
    });
  }
}

/**
 * Update item status (pause/resume)
 */
export async function updateItemStatus(req, res) {
  try {
    const { userId, productId, status } = req.body;

    if (!userId || !productId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "userId, productId, and status are required" 
      });
    }

    if (!["active", "paused", "cancelled"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Must be: active, paused, or cancelled" 
      });
    }

    const item = await BasketItem.findOneAndUpdate(
      { userId, productId },
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Item not found in basket" 
      });
    }

    console.log(`🔄 Updated status for ${productId}: ${status}`);

    res.json({
      success: true,
      message: "Item status updated successfully",
      basketItem: item,
    });
  } catch (err) {
    console.error("❌ Update status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update item status",
      error: err.message 
    });
  }
}

/**
 * Get items due for purchase
 */
export async function getDueItems(req, res) {
  try {
    const now = new Date();

    const items = await BasketItem.find({
      status: "active",
      nextRunAt: { $lte: now },
    }).sort({ nextRunAt: 1 });

    console.log(`⏰ Found ${items.length} items due for purchase`);

    res.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (err) {
    console.error("❌ Fetch due items error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch due items",
      error: err.message 
    });
  }
}
