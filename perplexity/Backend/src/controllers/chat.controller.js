import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body;

  let title = null,
    chat = null;
  const activeChatId = chatId || null;

  if (!activeChatId) {
    title = await generateChatTitle(message);

    chat = await chatModel.create({
      user: req.user.id,
      title: title,
    });
  }

  await messageModel.create({
    chat: activeChatId || chat._id,
    content: message,
    role: "user",
  });

  const messages = await messageModel.find({ chat: activeChatId || chat._id });
  const result = await generateResponse(messages);

  const aiMessage = await messageModel.create({
    chat: activeChatId || chat._id,
    content: result,
    role: "ai",
  });

  res.status(201).json({
    title,
    chat: chat || { _id: activeChatId, title: "Existing Chat" },
    aiMessage,
  });
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id });

  res.status(201).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  }).sort({ createdAt: 1 });

  res.status(201).json({
    message: "Chats retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId
  })

  if(!chat){
    return res.status(404).json({
      message: "chat not found"
    })
  }

  res.status(200).json({
    message: "chat delete successfully"
  })
}