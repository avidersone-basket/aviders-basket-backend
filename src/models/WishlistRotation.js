import mongoose from "mongoose";

const WishlistRotationSchema = new mongoose.Schema(
  {
    currentIndex: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 4, // 0-4 for 5 wishlists
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const WishlistRotation = mongoose.model("WishlistRotation", WishlistRotationSchema);
