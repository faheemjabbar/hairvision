import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect,adminOnly } from "../middleware/authmiddleware.js";

const router = express.Router();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', registerUser);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", loginUser);
/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user,
  });
});
// router.get("/admin", protect, adminOnly, handler); //write logic for the route handler
export default router;