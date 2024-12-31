import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import fs from "fs";
import Contact from "./routes/contact.js";
import { fileURLToPath } from "url";
import path from "path"; // مكتبة لتحديد المسارات

// تحديد __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = fs.readFileSync("./config/config.json");
const config = JSON.parse(rawData);

// Load environment variables
const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI;

// Create the Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", Contact);

// تقديم ملفات React الثابتة
const buildPath = path.join(__dirname, "../frontend/build"); // تعديل المسار حسب موقع المجلد
app.use(express.static(buildPath));

// رد صفحة React لأي طلب غير معروف
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
