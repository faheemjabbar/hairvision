import mongoose from "mongoose";

const tipSchema = new mongoose.Schema({
  conditionTag: String, // "dandruff"
  description: String,
});

export default mongoose.model("Tips", tipSchema);