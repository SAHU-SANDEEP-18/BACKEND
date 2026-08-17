import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    url: { type: String, required: true },
    fileId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("GeneratedImage", imageSchema);