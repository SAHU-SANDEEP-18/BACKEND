import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
  moveChatToFolder,
} from "../controllers/folder.controller.js";

const folderRouter = express.Router();

folderRouter.post("/", authUser, createFolder);
folderRouter.get("/", authUser, getFolders);
folderRouter.put("/:folderId", authUser, renameFolder);
folderRouter.delete("/:folderId", authUser, deleteFolder);
folderRouter.put("/move/:chatId", authUser, moveChatToFolder);

export default folderRouter;