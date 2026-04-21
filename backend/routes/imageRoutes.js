import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadImage } from "../controllers/imageController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// POST /api/images/upload
router.post("/upload", protect, upload.single("image"), uploadImage);

export default router;
