import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Portfolio from "../models/Portfolio";
import { auth } from "../middleware/auth";

const router = express.Router();

// Helper to get database connection status
const isConnected = () => mongoose.connection.readyState === 1;

// Path to fallback JSON file
const DB_JSON_PATH = path.resolve(__dirname, "../../../frontend/lib/db.json");

// Public route to get portfolio data
router.get("/", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    let mongoData = null;

    // 1. Try fetching from MongoDB first
    if (isConnected()) {
      try {
        mongoData = await (Portfolio as any).findOne().lean();
        if (mongoData) {
          console.log("Fetching portfolio data from MongoDB");
          return res.json(mongoData);
        }
      } catch (err) {
        console.error(
          "Error fetching from MongoDB, falling back to JSON:",
          err,
        );
      }
    }

    // 2. Fallback to JSON file
    if (fs.existsSync(DB_JSON_PATH)) {
      console.log("Fetching portfolio data from local JSON");
      const jsonData = JSON.parse(fs.readFileSync(DB_JSON_PATH, "utf8"));
      return res.json(jsonData);
    }

    res.status(404).json({ error: "Portfolio data not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route to update portfolio data
router.post("/", auth, async (req, res) => {
  try {
    const portfolioData = req.body;

    // 1. Update JSON file (Primary)
    try {
      fs.writeFileSync(DB_JSON_PATH, JSON.stringify(portfolioData, null, 2));
    } catch (fsErr: any) {}

    // 2. Update MongoDB if connected (Secondary)
    if (isConnected()) {
      try {
        await (Portfolio as any).findOneAndUpdate({}, portfolioData, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        });
      } catch (dbErr: any) {}
    }

    res.json(portfolioData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
