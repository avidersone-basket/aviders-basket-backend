import BasketItem from "../models/BasketItem.js";
import { WishlistRotation } from "../models/WishlistRotation.js";

const WISHLISTS = [
  "2UXWTCZV1NEL2",
  "KRF7Z0109CDU",
  "24VB0A2VMIWFX",
  "1A37JWTZP80MQ",
  "2MW3NMKMDBM4B"
];

/**
 * Checkout basket items
 * Handles Quick Buy (wishlist), Scheduled (save), or Mixed
 */
export async function checkoutBasket(req, res) {
  try {
    const { userId, selectedProductIds } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "userId is required" 
      });
    }

    // Get selected items (or all active if none specified)
    const query = { userId, status: "active" };
    if (selectedProductIds && selectedProductIds.length > 0) {
      query.productId = { $in: selectedProductIds };
    }

    const items = await BasketItem.find(query);

    if (items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No items to checkout" 
      });
    }

    // Separate Quick Buy vs Scheduled
    const quickBuyItems = items.filter(i => i.frequency.type === "buy_once");
    const scheduledItems = items.filter(i => i.frequency.type !== "buy_once");

    let wishlistUrl = null;

    // Handle Quick Buy items
    if (quickBuyItems.length > 0) {
      const wishlistId = await getNextWishlist();
      const asins = quickBuyItems.map(i => i.productId);
      const source = quickBuyItems[0].source || "amazon_in";
      const affiliateTag = source === "amazon_us" ? "aviders-20" : "aviders-21";
      const domain = source === "amazon_us" ? "amazon.com" : "amazon.in";

      // Build wishlist URL with affiliate tag
      wishlistUrl = `https://www.${domain}/hz/wishlist/ls/${wishlistId}?ref_=wl_share&tag=${affiliateTag}`;

      console.log(`✅ Quick Buy: ${quickBuyItems.length} items → Wishlist ${wishlistId}`);
    }

    // Handle Scheduled items (just confirm they're saved)
    if (scheduledItems.length > 0) {
      console.log(`📅 Scheduled: ${scheduledItems.length} items saved for future delivery`);
    }

    // Calculate totals
    const quickBuyTotal = quickBuyItems.reduce((sum, item) => 
      sum + (item.priceAtAdd * item.quantity), 0
    );
    const scheduledTotal = scheduledItems.reduce((sum, item) => 
      sum + (item.priceAtAdd * item.quantity), 0
    );

    res.json({
      success: true,
      checkoutType: quickBuyItems.length > 0 && scheduledItems.length > 0 
        ? "mixed" 
        : quickBuyItems.length > 0 
          ? "quick_buy" 
          : "scheduled",
      wishlistUrl,
      summary: {
        quickBuy: {
          count: quickBuyItems.length,
          total: quickBuyTotal,
          items: quickBuyItems.map(i => ({
            productId: i.productId,
            title: i.title,
            price: i.priceAtAdd,
            quantity: i.quantity,
          })),
        },
        scheduled: {
          count: scheduledItems.length,
          total: scheduledTotal,
          items: scheduledItems.map(i => ({
            productId: i.productId,
            title: i.title,
            price: i.priceAtAdd,
            quantity: i.quantity,
            frequency: i.frequency,
            nextRunAt: i.nextRunAt,
          })),
        },
      },
    });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ 
      success: false,
      message: "Checkout failed",
      error: err.message 
    });
  }
}

/**
 * Get next wishlist in rotation
 */
async function getNextWishlist() {
  try {
    // Get or create rotation state
    let rotation = await WishlistRotation.findOne();
    
    if (!rotation) {
      rotation = await WishlistRotation.create({ currentIndex: 0 });
    }

    const wishlistId = WISHLISTS[rotation.currentIndex];
    
    // Rotate to next
    const nextIndex = (rotation.currentIndex + 1) % WISHLISTS.length;
    await WishlistRotation.findByIdAndUpdate(rotation._id, { 
      currentIndex: nextIndex,
      lastUsedAt: new Date(),
    });

    console.log(`🔄 Wishlist rotation: ${rotation.currentIndex} → ${nextIndex}`);

    return wishlistId;
  } catch (err) {
    console.error("❌ Wishlist rotation error:", err);
    // Fallback to first wishlist
    return WISHLISTS[0];
  }
}

/**
 * Get due scheduled items (for cron/worker)
 */
export async function getDueScheduledItems(req, res) {
  try {
    const now = new Date();

    const dueItems = await BasketItem.find({
      status: "active",
      "frequency.type": { $ne: "buy_once" },
      nextRunAt: { $lte: now },
    }).sort({ nextRunAt: 1 });

    console.log(`⏰ Found ${dueItems.length} due scheduled items`);

    res.json({
      success: true,
      count: dueItems.length,
      items: dueItems,
    });
  } catch (err) {
    console.error("❌ Get due items error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get due items",
      error: err.message 
    });
  }
}
