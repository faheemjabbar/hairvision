import Upload from "../model/Upload.js";
import Report from "../model/Report.js";
import Tip from "../model/Tip.js";
import { isValidCondition, isValidSeverity, CONDITION_SEVERITY } from "../config/constants.js";

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Save upload record to MongoDB
        const upload = await Upload.create({
            user: req.user,
            fileUrl: req.file.path,
        });

        // ── Call Flask AI server ──────────────────────────────────
        let condition, confidence, severity, conditions, tips, low_confidence,
            conditionPlain, description;

        try {
            const FormData = (await import("form-data")).default;
            const fetch = (await import("node-fetch")).default;
            const fs = await import("fs");

            const form = new FormData();
            form.append("image", fs.createReadStream(req.file.path));

            // Add Flask authentication header
            const flaskApiKey = process.env.FLASK_API_KEY || "dev-key";

            const aiRes = await fetch("http://localhost:5001/predict", {
                method: "POST",
                body: form,
                headers: {
                    ...form.getHeaders(),
                    "X-API-Key": flaskApiKey,
                },
                timeout: 30000, // 30 second timeout
            });

            // Handle Flask errors explicitly
            if (!aiRes.ok) {
                const errorText = await aiRes.text();
                console.error(`Flask error (${aiRes.status}):`, errorText);

                // Return 503 if Flask server error, don't use mock data
                return res.status(503).json({
                    message: "AI analysis service temporarily unavailable",
                    details: "The image analysis service is not responding. Please try again later.",
                });
            }

            const data = await aiRes.json();

            // Validate Flask response structure
            if (!data.condition) {
                throw new Error("Invalid Flask response: missing condition");
            }

            // Validate condition name exists
            if (!isValidCondition(data.condition)) {
                console.warn(`Unknown condition from Flask: ${data.condition}`);
            }

            condition = data.condition;
            confidence = data.confidence;
            severity = data.severity || CONDITION_SEVERITY[condition] || "mild";

            // Validate severity
            if (!isValidSeverity(severity)) {
                console.warn(`Invalid severity from Flask: ${severity}, using default`);
                severity = "mild";
            }

            conditions = data.top_predictions ?? [{ 
                name: condition, 
                condition_plain: data.condition_plain,
                description: data.description,
                confidence, 
                severity 
            }];
            
            tips = data.tips ?? [];
            low_confidence = data.low_confidence ?? (confidence < 50.0);
            conditionPlain = data.condition_plain ?? condition;
            description = data.description ?? "";

        } catch (flaskError) {
            console.error("Flask communication error:", flaskError.message);

            // Only return 503 for connection/timeout errors, not for validation errors
            if (flaskError.message.includes("ECONNREFUSED") || 
                flaskError.message.includes("timeout")) {
                return res.status(503).json({
                    message: "AI analysis service unavailable",
                    details: "Cannot connect to image analysis service. Check if Flask server is running on port 5001.",
                });
            }

            // For other errors, return 500
            throw flaskError;
        }

        // ──────────────────────────────────────────────────────────

        // Create report with proper conditions array
        const report = await Report.create({
            user: req.user,
            upload: upload._id,
            condition,
            conditionPlain,
            description,
            confidence,
            severity,
            conditions: conditions.map(c => ({
                name: c.name,
                condition_plain: c.condition_plain || c.name,
                description: c.description || "",
                confidence: c.confidence,
                severity: c.severity || "mild",
            })),
            lowConfidence: low_confidence,
        });

        // Fetch additional tips from database if tips are empty
        let finalTips = tips;
        if (!finalTips || finalTips.length === 0) {
            const dbTips = await Tip.find({ 
                conditionTag: condition 
            }).limit(5);
            finalTips = dbTips.map((t) => t.description);
        }

        res.status(201).json({
            reportId: report._id,
            condition,
            conditionPlain,
            description,
            confidence,
            severity,
            conditions: report.conditions, // Return properly structured array
            tips: finalTips,
            low_confidence,
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ 
            message: error.message || "Image analysis failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * Serve image through authenticated route
 * Only the user who uploaded or admin can access
 */
export const getImage = async (req, res) => {
    try {
        const { uploadId } = req.params;

        const upload = await Upload.findById(uploadId);
        if (!upload) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Check authorization: only uploader or admin can view
        if (upload.user.toString() !== req.user.toString() && req.userRole !== "admin") {
            return res.status(403).json({ message: "Not authorized to access this image" });
        }

        // Serve file with proper headers
        res.sendFile(upload.fileUrl);

    } catch (error) {
        console.error("Get image error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete image (for user data deletion)
 */
export const deleteImage = async (req, res) => {
    try {
        const { uploadId } = req.params;

        const upload = await Upload.findById(uploadId);
        if (!upload) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Only uploader can delete their own image
        if (upload.user.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this image" });
        }

        // Delete file from disk
        const fs = await import("fs");
        if (fs.existsSync(upload.fileUrl)) {
            fs.unlinkSync(upload.fileUrl);
        }

        // Delete from database
        await Upload.findByIdAndDelete(uploadId);
        await Report.deleteMany({ upload: uploadId });

        res.json({ message: "Image deleted successfully" });

    } catch (error) {
        console.error("Delete image error:", error);
        res.status(500).json({ message: error.message });
    }
};