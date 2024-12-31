import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // تأكد من إضافة .js إذا كنت تستخدم ES Modules
import fs from 'fs';

const rawData = fs.readFileSync('./config/config.json');
const config = JSON.parse(rawData);
const router = express.Router();

// تسجيل الدخول
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // التحقق من وجود المستخدم
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // إنشاء التوكن
        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // تحقق من وجود المستخدم أو البريد الإلكتروني مسبقًا
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        if (existingEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء مستخدم جديد
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
