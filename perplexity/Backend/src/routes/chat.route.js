import { Router } from "express";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
  regenerateResponse,
  editMessage,
  renameChat,
} from "../controllers/chat.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
const chatRouter = Router();

chatRouter.post("/message", authUser, sendMessage);
chatRouter.get("/", authUser, getChats);
chatRouter.get("/:chatId/messages", authUser, getMessages);
chatRouter.post("/:chatId/regenerate", authUser, regenerateResponse);
chatRouter.put("/:chatId/messages/:messageId", authUser, editMessage);
chatRouter.put("/:chatId/title", authUser, renameChat);
chatRouter.delete("/delete/:chatId/", authUser, deleteChat);

export default chatRouter;
