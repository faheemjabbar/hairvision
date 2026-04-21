import mongoose from "mongoose";

const analysisReport = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    upload: {type : mongoose.Schema.Types.ObjectId, ref: "Upload"},

    condition: String,       // primary condition
    confidence: Number,
    severity: String,
    conditions: String,      // JSON array of all detected conditions
}, {timestamps:true});

export default mongoose.model("Report", analysisReport);