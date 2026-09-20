import mongoose from "mongoose";

const elementSchema = new mongoose.Schema(
  {
    id: String,
    type: { type: String, enum: ["text", "image"] },
    content: String, // text-elements ke liye
    src: String, // image-elements ke liye
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    fontSize: Number,
  },
  { _id: false },
);

const slideSchema = new mongoose.Schema(
  {
    id: String,
    elements: { type: [elementSchema], default: [] },
  },
  { _id: false },
);

const deckSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Deck" },
    prompt: String,
    slides: { type: [slideSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Deck", deckSchema);