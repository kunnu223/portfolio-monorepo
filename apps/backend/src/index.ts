import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "https://portfolio-monorepo-frontend-two.vercel.app", // Add your actual Vercel URL here
      ];

      // Also allow Vercel preview deployments
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // For strictly blocking unknown origins in production, uncomment the error
      // return callback(new Error('Not allowed by CORS'));

      // For now, during setup, we can default to allow if mostly public
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Disable CSP for simpler development
  }),
);
app.use(morgan("dev"));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// DB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    bufferCommands: false, // Disable buffering if not connected
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log(
      "Tip: Make sure MongoDB is running locally or check your MONGODB_URI in apps/backend/.env",
    );
  });

// Routes
import authRoutes from "./routes/auth";
import portfolioRoutes from "./routes/portfolio";
import uploadRoutes from "./routes/upload";

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Portfolio API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
