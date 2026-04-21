import express from "express";
import { submitFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// POST /api/feedback
router.post("/", protect, submitFeedback);

export default router;
