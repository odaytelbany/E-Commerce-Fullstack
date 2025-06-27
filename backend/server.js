import authRouter from "./routes/auth.route.js";
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use("/api/auth", authRouter)

app.listen(PORT, () => {
    console.log("Server is running on port 5000");
    connectDB();
})