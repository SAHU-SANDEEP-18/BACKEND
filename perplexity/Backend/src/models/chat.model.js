import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // taaki multiple null-values allowed rahein (unique sirf non-null pe apply ho)
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    collaborators: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    inviteToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
