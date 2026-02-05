import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_12345";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

router.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, success: true });
  }

  res.status(401).json({ success: false, message: "Invalid password" });
});

router.get("/check", auth, (req, res) => {
  res.json({ authenticated: true });
});

export default router;
