import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    condition_plain: String,
    description: String,
    confidence: { type: Number, required: true },
    severity: String,
}, { _id: false });

const analysisReport = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Index for faster queries
    },
    upload: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
        required: true,
    },

    // Primary condition
    condition: {
        type: String,
        required: true,
        index: true, // Allow filtering by condition
    },
    conditionPlain: String,
    description: String,
    confidence: {
        type: Number,
        required: true,
    },
    severity: {
        type: String,
        enum: ["healthy", "mild", "moderate", "severe"],
        default: "mild",
        index: true,
    },

    // All detected conditions (array of subdocuments)
    // This replaces the previous JSON string approach
    conditions: {
        type: [conditionSchema],
        default: [],
    },

    // Low confidence flag
    lowConfidence: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Compound index for common queries
analysisReport.index({ user: 1, createdAt: -1 });
analysisReport.index({ severity: 1, createdAt: -1 });

export default mongoose.model("Report", analysisReport);