import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import basketRoutes from "./routes/basketRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

await connectDB();

app.use("/basket", basketRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Basket server running on port ${PORT}`);
});
