import express from "express";
import Product from "../models/Product.js"; // adjust if name differs

const router = express.Router();

/**
 * GET ALL CATEGORIES (NO PAGINATION)
 * /basket/categories?region=in
 */
router.get("/basket/categories", async (req, res) => {
  try {
    const region = req.query.region || "in";

    const categories = await Product.aggregate([
      { $match: { region } },
      { $group: { _id: "$category" } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      categories: categories
        .map(c => c._id)
        .filter(Boolean),
    });
  } catch (err) {
    console.error("Category fetch error", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
});

export default router;
