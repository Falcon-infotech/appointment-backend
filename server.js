import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import connectDB from "./config/dbConnection.js";
import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import branchRouter from "./routes/branchRoutes.js";
import inspectorRouter from "./routes/inspectorRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import batchRouter from "./routes/batchRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://appointment-frontend-gold-two.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// This fixes the crash1
app.options('/', cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/branch", branchRouter);
app.use("/api/inspector", inspectorRouter);
app.use("/api/course", courseRouter);
app.use("/api/batch", batchRouter);


app.get("/", (req, res) => {
  res.send("Training Management System Backend is running ");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();

});
