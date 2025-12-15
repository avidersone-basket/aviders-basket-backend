import ProductIN from "../models/ProductIN.js";

/**
 * GET /basket/products
 * Returns products eligible for Aviders Basket
 */
export async function getBasketProducts(req, res) {
  try {
    const products = await ProductIN.find({
      basketEligible: true,
      stock: "in_stock",
    })
      .sort({ updated_at: -1 })
      .lean();

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Basket fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load basket products",
    });
  }
}
