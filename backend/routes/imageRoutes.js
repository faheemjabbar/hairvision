import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadImage, getImage, deleteImage } from "../controllers/imageController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/images/upload:
 *   post:
 *     summary: Upload image for AI analysis
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded and analyzed
 *       400:
 *         description: No file provided
 *       503:
 *         description: AI service unavailable
 */
router.post("/upload", protect, upload.single("image"), uploadImage);

/**
 * @openapi
 * /api/images/{uploadId}:
 *   get:
 *     summary: Get uploaded image (authenticated)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Images
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image file
 *       404:
 *         description: Image not found
 *       403:
 *         description: Not authorized to access
 */
router.get("/:uploadId", protect, getImage);

/**
 * @openapi
 * /api/images/{uploadId}:
 *   delete:
 *     summary: Delete uploaded image and associated report
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Images
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted
 *       404:
 *         description: Image not found
 *       403:
 *         description: Not authorized to delete
 */
router.delete("/:uploadId", protect, deleteImage);

export default router;