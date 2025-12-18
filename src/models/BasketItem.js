import mongoose from "mongoose";

const FrequencySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["weekly", "monthly", "custom", "buy_once"],
      required: true,
    },

    // For weekly
    dayOfWeek: {
      type: Number, // 0 = Sunday ... 6 = Saturday
      default: null,
    },

    // For monthly
    dayOfMonth: {
      type: Number, // 1 - 28 (safe range)
      default: null,
    },

    // For custom
    intervalDays: {
      type: Number, // every X days
      default: null,
    },
  },
  { _id: false }
);

const BasketItemSchema = new mongoose.Schema(
  {
    // 🔐 USER
    userId: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    // 🧾 PRODUCT (reference only, no duplication)
    productId: {
      type: String,
      required: true,
      index: true,
    },

    // Product display info (snapshot at add time)
    title: {
      type: String,
      default: null,
    },

    image: {
      type: String,
      default: null,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    source: {
      type: String, // amazon_in | amazon_us | woocommerce
      required: true,
    },

    affiliateUrl: {
      type: String,
      required: true,
    },

    // 💰 SNAPSHOT (price may change later)
    priceAtAdd: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // 🔁 RECURRING LOGIC
    frequency: {
      type: FrequencySchema,
      required: true,
    },

    nextRunAt: {
      type: Date,
      required: true,
      index: true,
    },

    // 📌 STATUS
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// 🚀 Prevent duplicate same-product basket entries per user
BasketItemSchema.index(
  { userId: 1, productId: 1 },
  { unique: true }
);

export default mongoose.model("BasketItem", BasketItemSchema);
