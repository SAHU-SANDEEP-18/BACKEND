import { generateResponseStream, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getID } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body;
  const io = getID();

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

  const resolvedChatId = activeChatId || chat._id;

  await messageModel.create({
    chat: resolvedChatId,
    content: message,
    role: "user",
  });

  const pastMessages = await messageModel
    .find({ chat: resolvedChatId })
    .select("role content -_id");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(
    `data: ${JSON.stringify({
      type: "meta",
      title,
      chatId: resolvedChatId,
    })}\n\n`,
  );

  // AI soch raha hai — turant bata do
  io.to(`user:${req.user.id}`).emit("ai:thinking", { chatId: resolvedChatId });

  let fullText = "";
  let firstChunkReceived = false;

  try {
    const stream = generateResponseStream(pastMessages);

    for await (const chunk of stream) {
      if (!firstChunkReceived) {
        // pehla chunk aaya — matlab ab actual typing shuru
        io.to(`user:${req.user.id}`).emit("ai:typing", { chatId: resolvedChatId });
        firstChunkReceived = true;
      }

      fullText += chunk;
      res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
    }

    const aiMessage = await messageModel.create({
      chat: resolvedChatId,
      content: fullText,
      role: "ai",
    });

    io.to(`user:${req.user.id}`).emit("ai:done", { chatId: resolvedChatId });
    res.write(`data: ${JSON.stringify({ type: "done", aiMessage })}\n\n`);
  } catch (err) {
    console.error("Stream error:", err);
    io.to(`user:${req.user.id}`).emit("ai:error", { chatId: resolvedChatId, error: err.message });
    res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
  } finally {
    res.end();
  }
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id });

  res.status(200).json({
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

  const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "chat not found",
    });
  }

  await messageModel.deleteMany({ chat: chatId });

  res.status(200).json({
    message: "chat deleted successfully",
  });
}