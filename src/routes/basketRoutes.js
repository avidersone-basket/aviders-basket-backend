import express from "express";
import { getBasketProducts } from "../controllers/basketController.js";

const router = express.Router();

// PUBLIC – no auth for now
router.get("/products", getBasketProducts);

export default router;
