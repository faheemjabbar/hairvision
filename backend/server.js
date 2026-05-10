import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ── Rate Limiting ──────────────────────────────────────────
// Only limit uploads — not general reads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: (req) => req.user || req.ip,
    message: { message: "Too many image uploads. Please try again in an hour." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.userRole === "admin",
});

// General API limiter — only applies to POST/PUT/DELETE, not GET
// This prevents hammering writes while allowing normal page loads
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 200 : 1000,
    message: { message: "Too many requests. Please try again later." },
    skip: (req) => req.method === "GET", // never rate-limit reads
});

// ── Startup validation ──────────────────────────────────────
const validateEnv = () => {
    const required = ["MONGO_URI", "JWT_KEY"];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error("❌ Missing environment variables:", missing.join(", "));
        console.error("Create a .env file with these variables");
        process.exit(1);
    }

    console.log("✓ Environment variables validated");
};

validateEnv();

// ── Database connection ────────────────────────────────────
connectDB();

// ── Health check endpoint ──────────────────────────────────
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// ── Static files ───────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes (with rate limiting) ────────────────────────────
app.use(apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/images", uploadLimiter, imageRoutes); // Apply upload limiter to image routes
app.use("/api/reports", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

// ── Documentation ──────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Error handling ─────────────────────────────────────────
app.use((err, req, res, next) => {
    // Handle multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large. Max 10MB." });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Only one file allowed." });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Unexpected file field." });
    }

    // Generic error
    console.error("Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
});

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     HairVision API Server (Dev)       ║
╠════════════════════════════════════════╣
║ Server:    http://localhost:${PORT}          
║ Docs:      http://localhost:${PORT}/api-docs
║ Health:    http://localhost:${PORT}/health
╚════════════════════════════════════════╝
    `);
});