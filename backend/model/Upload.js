import mongoose, { mongo } from "mongoose";

const imageSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    fileUrl: String,
}, {timestamps: true});

export default mongoose.model("Upload", imageSchema);