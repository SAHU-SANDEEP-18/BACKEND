import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const indexes = await chatModel.collection.indexes();
    const shareIdIndex = indexes.find((index) => index.key?.shareId === 1);
    const hasPartialUniqueIndex =
      shareIdIndex?.unique &&
      shareIdIndex.partialFilterExpression?.shareId?.$type === "string";

    if (!hasPartialUniqueIndex) {
      if (shareIdIndex) {
        await chatModel.collection.dropIndex(shareIdIndex.name);
      }

      await chatModel.collection.updateMany(
        { shareId: null },
        { $unset: { shareId: "" } },
      );

      await chatModel.collection.createIndex(
        { shareId: 1 },
        {
          unique: true,
          partialFilterExpression: { shareId: { $type: "string" } },
        },
      );
    }

    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection or index migration failed:", err);
    throw err;
  }
}

export default connectToDB;