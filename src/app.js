import express from "express";
import cors from "cors";
import basketRoutes from "./routes/basketRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("Aviders Basket API Live"));
app.use("/basket", basketRoutes);

export default app;
