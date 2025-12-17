# Aviders Basket Backend

Backend service for managing user shopping baskets with recurring purchase scheduling.

## Features

- ✅ Add/Remove items from basket
- ✅ Support for recurring purchases (weekly, monthly, custom intervals)
- ✅ Multi-source product support (Amazon, WooCommerce)
- ✅ Price snapshot tracking
- ✅ Automatic next-run date calculation
- ✅ MongoDB database with Mongoose ODM

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose
- **CORS** enabled for cross-origin requests
- **ES Modules** (type: module)

## API Endpoints

### POST /basket
Add or update an item in the basket

**Request Body:**
```json
{
  "userId": "string (required)",
  "email": "string (required)",
  "productId": "string (required)",
  "source": "string (amazon_in | amazon_us | woocommerce)",
  "affiliateUrl": "string (required)",
  "priceAtAdd": "number (required)",
  "currency": "string (default: INR)",
  "frequency": {
    "type": "weekly | monthly | custom | buy_once",
    "dayOfWeek": "number (0-6, for weekly)",
    "dayOfMonth": "number (1-28, for monthly)",
    "intervalDays": "number (for custom)"
  }
}
```

### GET /basket?userId={userId}
Get all active basket items for a user

**Response:**
```json
{
  "total": 5,
  "items": [...]
}
```

### DELETE /basket
Remove an item from the basket

**Request Body:**
```json
{
  "userId": "string (required)",
  "productId": "string (required)"
}
```

## Environment Variables

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aviders_basket
PORT=8080
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Deployment

This backend is designed to be deployed on platforms like:
- Render
- Railway
- Heroku
- DigitalOcean App Platform

## Database Schema

### BasketItem
- `userId` (String, indexed)
- `email` (String, indexed)
- `productId` (String, indexed)
- `source` (String: amazon_in, amazon_us, woocommerce)
- `affiliateUrl` (String)
- `priceAtAdd` (Number)
- `currency` (String, default: "INR")
- `frequency` (Object with type, dayOfWeek, dayOfMonth, intervalDays)
- `nextRunAt` (Date, indexed)
- `status` (String: active, paused, cancelled)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

**Unique Index:** `userId + productId` (prevents duplicate products per user)

## License

MIT
