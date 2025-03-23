// Imports
import "dotenv/config";
import cors from "cors";
import express from "express";
import { notFound } from "./controllers/notFoundController";
import productRoutes from "./routes/productRoutes";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import userReviewRoutes from "./routes/userReviewRoutes";
import cookieParser from "cookie-parser";

// Variables
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/p", productRoutes);
app.use("/u", userRoutes);
app.use("/r", userReviewRoutes);
app.all("*", notFound);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:PR2Tc3qmhHEzpSO3@wegotboard-01.rr0nz.mongodb.net/wegotboard?retryWrites=true&w=majority&appName=WeGotBoard-01"
    );
    console.log("Database connection OK");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB().then(() => {
  // Server Listening
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}! 🚀`);
  });
});

// Export
export default app;
