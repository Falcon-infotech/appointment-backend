import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import connectDB from "./config/dbConnection.js";
import authRoutes from "./routes/authRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();

// app.use(cors({
//   origin: function (origin, callback) {

//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//        return callback(null, true);
//     } else {
//     return  callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   credentials: true
// }));
// app.options('*', cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("HRMS Backend is running ");
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();

});