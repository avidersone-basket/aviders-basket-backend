import { firebaseAdmin } from "../config/firebase.js";
import BasketItem from "../models/BasketItem.js";

/**
 * Send Basket Restock Notifications
 * This checks for items due in the next 24 hours
 */
export async function sendBasketReminders() {
  if (!firebaseAdmin) {
    console.error("⚠️ FCM skipped: Firebase Admin not initialized");
    return { success: false, message: "Firebase not ready" };
  }

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Find active items due by tomorrow
    const dueItems = await BasketItem.find({
      status: "active",
      "frequency.type": { $ne: "buy_once" },
      nextRunAt: { $lte: tomorrow },
    });

    if (dueItems.length === 0) {
      return { success: true, count: 0 };
    }

    console.log(`🔔 Processing ${dueItems.length} basket reminders...`);

    let sentCount = 0;
    let errorCount = 0;

    // 2. Group items by user to avoid spamming multiple notifications
    const userGroups = dueItems.reduce((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = [];
      acc[item.userId].push(item);
      return acc;
    }, {});

    // 3. Send notifications (Iterate through users)
    for (const userId in userGroups) {
      const items = userGroups[userId];
      const firstItem = items[0];
      
      // Build notification content
      const title = items.length > 1 
        ? "Restock Alert: Multiple Items Due" 
        : `Restock Alert: ${firstItem.title}`;
      
      const body = items.length > 1
        ? `You have ${items.length} items in your basket ready for checkout.`
        : `Your ${firstItem.title} is due for restock. Tap to checkout.`;

      const message = {
        data: {
          type: "basket_reminder",
          title: title,
          body: body,
          productId: firstItem.productId,
          count: items.length.toString()
        },
        topic: `user_${userId}` // Sending via topic unique to user
      };

      try {
        await firebaseAdmin.messaging().send(message);
        sentCount++;
      } catch (err) {
        console.error(`❌ FCM error for user ${userId}:`, err.message);
        errorCount++;
      }
    }

    return { 
      success: true, 
      sent: sentCount, 
      errors: errorCount 
    };
  } catch (err) {
    console.error("❌ Reminder Job Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Endpoint to manually trigger reminders (for testing or external cron)
 */
export async function triggerReminders(req, res) {
  const result = await sendBasketReminders();
  res.json(result);
}
