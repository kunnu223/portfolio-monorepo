import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { auth } from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "portfolio",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    resource_type: "auto",
  } as any,
});

const upload = multer({ storage });

router.post("/", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  // Cloudinary returns the URL in req.file.path
  res.json({ success: true, url: req.file.path });
});

router.delete("/", auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res
        .status(400)
        .json({ success: false, message: "No URL provided" });
    }

    // Extract public ID from Cloudinary URL
    // Matches: /upload/(v1234/)?(folder/filename).ext
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = url.match(regex);

    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Cloudinary URL" });
    }

    const publicId = match[1];

    // Determine resource type based on extension or default to image
    const isRaw = url.match(/\.pdf$/i);
    const resourceType = isRaw ? "raw" : "image";

    // Delete from Cloudinary
    // Note: PDF might be 'image' or 'raw' depending on how it was uploaded.
    // We try 'image' first for PDFs as multer-storage-cloudinary typically handles them that way.
    // If you explicitly upload as raw, change this. With "auto", PDFs are often images (pages).

    // Using destroy
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "raw" ? "raw" : "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      // result: { result: 'ok' } or { result: 'not found' } etc.
      console.warn("Cloudinary delete result:", result);
    }

    res.json({ success: true, message: "File deleted successfully", result });
  } catch (err: any) {
    console.error("Delete error:", err);
    res
      .status(500)
      .json({ success: false, message: "Delete failed", error: err.message });
  }
});

export default router;
