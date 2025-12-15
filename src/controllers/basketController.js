import Basket from "../models/Basket.js";

/**
 * GET basket for user
 */
export async function getBasket(req, res) {
  const { userId } = req.params;

  const basket = await Basket.findOne({ userId });
  res.json(basket || { userId, items: [] });
}

/**
 * ADD / UPDATE item
 */
export async function addToBasket(req, res) {
  const { userId, email, item } = req.body;

  let basket = await Basket.findOne({ userId });

  if (!basket) {
    basket = new Basket({ userId, email, items: [] });
  }

  const index = basket.items.findIndex(
    (i) => i.productId === item.productId
  );

  if (index >= 0) {
    basket.items[index] = item;
  } else {
    basket.items.push(item);
  }

  await basket.save();
  res.json(basket);
}

/**
 * REMOVE item
 */
export async function removeFromBasket(req, res) {
  const { userId, productId } = req.body;

  const basket = await Basket.findOne({ userId });
  if (!basket) return res.json({});

  basket.items = basket.items.filter(
    (i) => i.productId !== productId
  );

  await basket.save();
  res.json(basket);
}

/**
 * CLEAR basket
 */
export async function clearBasket(req, res) {
  const { userId } = req.body;
  await Basket.deleteOne({ userId });
  res.json({ success: true });
}

