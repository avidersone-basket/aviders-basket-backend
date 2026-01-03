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

    case "quarterly": {
      const d = new Date(now);
      // For quarterly, deliver every 3 months on the same day
      d.setMonth(d.getMonth() + 3);
      
      // Get the day of month (default to current day if not provided)
      const dayOfMonth = freq.dayOfMonth || now.getDate();
      
      // Cap at 28 for safety (avoids February issues)
      d.setDate(Math.min(dayOfMonth, 28));
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
      title,
      image,
      quantity = 1,
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

    // ✅ UPDATED: Include "quarterly" in the validation
    if (!["weekly", "monthly", "quarterly", "custom", "buy_once"].includes(frequency.type)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid frequency type" 
      });
    }

    // Calculate next run date
    const nextRunAt = calculateNextRun(frequency);

    // Upsert basket item (including title and image)
    const item = await BasketItem.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        email,
        productId,
        title: title || null,
        image: image || null,
        quantity: quantity || 1,
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
 * UPDATED: Returning all items (active, paused) so frontend can handle filtering
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

    // REMOVED status: "active" to include paused items in the response
    const items = await BasketItem.find({
      userId,
      status: { $ne: "cancelled" } // Include active and paused, exclude cancelled
    }).sort({ createdAt: -1 });

    console.log(`📦 Fetched ${items.length} basket items for user ${userId} (including paused)`);

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

/**
 * Update basket item schedule
 * PATCH /basket/item/:itemId
 */
export async function updateSchedule(req, res) {
  try {
    const { itemId } = req.params;
    const { frequency } = req.body;

    if (!frequency || !frequency.type) {
      return res.status(400).json({ 
        success: false,
        message: "frequency.type required" 
      });
    }

    const item = await BasketItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Basket item not found" 
      });
    }

    // Recalculate nextRunAt
    const nextRunAt = calculateNextRun(frequency);

    item.frequency = frequency;
    item.nextRunAt = nextRunAt;

    await item.save();

    console.log(`✏️ Updated schedule for ${itemId}: ${frequency.type}`);

    res.json({
      success: true,
      message: "Schedule updated successfully",
      item,
    });
  } catch (err) {
    console.error("❌ Update schedule error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update schedule",
      error: err.message 
    });
  }
}

/**
 * Pause basket item
 * PATCH /basket/item/:id/pause
 */
export async function pauseItem(req, res) {
  try {
    const { id } = req.params;

    const item = await BasketItem.findById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Basket item not found" 
      });
    }

    item.status = "paused";
    await item.save();

    console.log(`⏸️ Paused item: ${id}`);

    res.json({
      success: true,
      message: "Basket item paused",
      item,
    });
  } catch (err) {
    console.error("❌ Pause error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to pause basket item",
      error: err.message 
    });
  }
}

/**
 * Resume basket item
 * PATCH /basket/item/:id/resume
 */
export async function resumeItem(req, res) {
  try {
    const { id } = req.params;

    const item = await BasketItem.findById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Basket item not found" 
      });
    }

    item.status = "active";
    item.nextRunAt = calculateNextRun(item.frequency);

    await item.save();

    console.log(`▶️ Resumed item: ${id}`);

    res.json({
      success: true,
      message: "Basket item resumed",
      item,
    });
  } catch (err) {
    console.error("❌ Resume error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to resume basket item",
      error: err.message 
    });
  }
}

/**
 * Update basket item quantity
 * PATCH /basket/item/:id/quantity
 */
export async function updateQuantity(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be >= 1" 
      });
    }

    const item = await BasketItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Basket item not found" 
      });
    }

    console.log(`🔢 Updated quantity for ${id}: ${quantity}`);

    res.json({
      success: true,
      message: "Quantity updated successfully",
      item,
    });
  } catch (err) {
    console.error("❌ Quantity update error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update quantity",
      error: err.message 
    });
  }
}
