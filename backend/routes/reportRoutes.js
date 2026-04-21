import express from "express";
import { getMyReports, getReportById } from "../controllers/reportController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// GET /api/reports/my
router.get("/my", protect, getMyReports);

// GET /api/reports/:id
router.get("/:id", protect, getReportById);

export default router;
