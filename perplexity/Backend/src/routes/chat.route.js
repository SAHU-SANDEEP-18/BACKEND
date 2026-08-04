import { Router } from "express";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
  regenerateResponse,
  editMessage,
  renameChat,
  uploadFiles,
  shareChat,
  unshareChat,
  getSharedChat,
} from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
const chatRouter = Router();

chatRouter.post("/upload", authUser, upload.array("files", 4), uploadFiles);
chatRouter.post("/message", authUser, sendMessage);
chatRouter.get("/", authUser, getChats);
chatRouter.post("/:chatId/share", authUser, shareChat);
chatRouter.post("/:chatId/unshare", authUser, unshareChat);
chatRouter.get("/:chatId/messages", authUser, getMessages);
chatRouter.post("/:chatId/regenerate", authUser, regenerateResponse);
chatRouter.put("/:chatId/messages/:messageId", authUser, editMessage);
chatRouter.put("/:chatId/title", authUser, renameChat);
chatRouter.delete("/delete/:chatId/", authUser, deleteChat);
chatRouter.get("/shared/:shareId", getSharedChat);

export default chatRouter;
