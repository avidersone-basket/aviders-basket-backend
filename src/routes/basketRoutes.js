import express from "express";
import {
  getBasket,
  addToBasket,
  removeFromBasket,
  clearBasket
} from "../controllers/basketController.js";

const router = express.Router();

router.get("/:userId", getBasket);
router.post("/add", addToBasket);
router.post("/remove", removeFromBasket);
router.post("/clear", clearBasket);

export default router;
