import express from "express";
import { getAllUsers, deleteUser, getAllFeedback } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET  /api/admin/users
router.get("/users", getAllUsers);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

// GET /api/admin/feedback
router.get("/feedback", getAllFeedback);

export default router;
