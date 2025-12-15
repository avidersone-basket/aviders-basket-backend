import mongoose from "mongoose";

const BasketItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true }, // ASIN or product ID
    source: { type: String, default: "amazon_in" },
    quantity: { type: Number, default: 1 },

    frequency: {
      type: String,
      enum: ["once", "weekly", "monthly", "custom"],
      default: "once"
    },

    dayOfMonth: Number,     // for monthly
    daysOfWeek: [Number],  // for weekly (0-6)
    customDays: [Number]   // custom gaps
  },
  { _id: false }
);

const BasketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Firebase UID
    email: { type: String, required: true },

    items: [BasketItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Basket", BasketSchema);
