import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import cron from "node-cron";
import { sendBasketReminders } from "./controllers/notificationController.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

await connectDB();

// 🚀 Start Notification Cron Job
// Runs every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running daily basket reminder job...");
  await sendBasketReminders();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Basket server running on port ${PORT}`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/basket`);
  console.log(`📅 Reminder CRON: Active (8:00 AM daily)`);
});
