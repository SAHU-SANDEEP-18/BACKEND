import { generateResponseStream, generateChatTitle } from "../services/ai.service.js";
import crypto from "crypto";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getID } from "../sockets/server.socket.js";
import { uploadToImageKit } from "../services/imagekit.service.js";
import { ingestDocument } from "../services/rag.service.js";

export async function uploadFiles(req, res) {
  if (!req.files?.length) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const attachments = await Promise.all(
      req.files.map(async (file) => {
        const { url, fileId } = await uploadToImageKit(file.buffer, file.originalname);
        return {
          url,
          fileId,
          name: file.originalname,
          mimeType: file.mimetype,
          kind: file.mimetype.startsWith("image/") ? "image" : "document",
        };
      }),
    );

    res.status(201).json({ attachments });
  } catch (err) {
    console.error("ImageKit upload failed:", err);
    res.status(500).json({ message: "File upload failed" });
  }
}

export async function sendMessage(req, res) {
  const { message, chat: chatId, quotedText, attachments } = req.body;
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

  // Agar existing-chat hai, confirm karo user ke paas access hai (owner ya collaborator)
  if (activeChatId) {
    const accessible = await hasAccess(activeChatId, req.user.id);
    if (!accessible) {
      return res.status(403).json({ message: "You don't have access to this chat" });
    }
  }

  const userMessage = await messageModel.create({
    chat: resolvedChatId,
    content: message,
    role: "user",
    quotedText: quotedText || null,
    attachments: attachments || [],
  });

  // PDF/DOCX attachments — pehle fully ingest (extract + embed + Pinecone upsert) karo,
  // AI response tabhi generate hoga jab document ka data ready ho chuka ho
  const docAttachments = (attachments || []).filter((a) => a.kind === "document");
  if (docAttachments.length > 0) {
    io.to(`user:${req.user.id}`).emit("ai:thinking", { chatId: resolvedChatId });
    const ingestResults = await Promise.all(
      docAttachments.map(async (att) => {
        try {
          const fileRes = await fetch(att.url);
          const arrayBuffer = await fileRes.arrayBuffer();
          return await ingestDocument({
            buffer: Buffer.from(arrayBuffer),
            mimetype: att.mimeType,
            fileName: att.name,
            chatId: String(resolvedChatId),
            attachmentId: att.fileId,
          });
        } catch (err) {
          console.error(`Ingestion failed for ${att.name}:`, err);
          return { chunksStored: 0 };
        }
      }),
    );

    // Pinecone "eventually consistent" hai — abhi-abhi upsert kiye vectors
    // turant queryable nahi hote, unko index hone mein kuch second lagte hain.
    // Agar kuch actually stored hua ho, thoda wait karo taaki agla retrieveContext() call
    // in vectors ko dhoondh sake, warna AI ko empty-context milega.
    const anyStored = ingestResults.some((r) => r.chunksStored > 0);
    if (anyStored) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  const pastMessages = await messageModel
    .find({ chat: resolvedChatId })
    .select("role content quotedText attachments -_id");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(
    `data: ${JSON.stringify({
      type: "meta",
      title,
      chatId: resolvedChatId,
      userMessageId: userMessage._id, // frontend ko bhejo taaki turant edit/regenerate kaam kare
    })}\n\n`,
  );

  // AI soch raha hai — turant bata do (agar document-ingestion ke dauraan already emit nahi hua)
  io.to(`chat:${resolvedChatId}`).emit("chat:user-message", {
    chatId: resolvedChatId,
    message: userMessage,
    senderId: req.user.id,
  });

  if (docAttachments.length === 0) {
    io.to(`chat:${resolvedChatId}`).emit("chat:ai-thinking", { chatId: resolvedChatId, senderId: req.user.id });
  }

  let fullText = "";
  let firstChunkReceived = false;
  let clientDisconnected = false;
  const abortController = new AbortController();

  // Jab client (browser) fetch abort kare, ye event fire hota hai —
  // isse hamare loop ko pata chalta hai ki ab chunks bhejna band karna hai,
  // AUR abortController.abort() se Gemini ki API-call ko bhi khud cancel kar dete hain
  req.on("close", () => {
    clientDisconnected = true;
    abortController.abort();
  });

  try {
    const stream = generateResponseStream(pastMessages, abortController.signal, resolvedChatId, req.user.customInstructions);

    for await (const chunk of stream) {
      if (clientDisconnected) break; // user ne stop kiya — loop se turant nikal jao

      if (!firstChunkReceived) {
        io.to(`chat:${resolvedChatId}`).emit("chat:ai-typing", { chatId: resolvedChatId, senderId: req.user.id });
        firstChunkReceived = true;
      }

      fullText += chunk;
      io.to(`chat:${resolvedChatId}`).emit("chat:ai-chunk", { chatId: resolvedChatId, chunk, senderId: req.user.id });
      res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
    }

    // Chahe pura complete hua ho ya beech mein roka gaya ho — jo bhi text bana hai wo save karo
    if (fullText.trim()) {
      const aiMessage = await messageModel.create({
        chat: resolvedChatId,
        content: fullText,
        role: "ai",
      });

      if (!clientDisconnected) {
        io.to(`chat:${resolvedChatId}`).emit("chat:ai-done", { chatId: resolvedChatId, aiMessage, senderId: req.user.id });
        res.write(`data: ${JSON.stringify({ type: "done", aiMessage })}\n\n`);
      }
    }
  } catch (err) {
    if (!clientDisconnected) {
      console.error("Stream error:", err);
      io.to(`chat:${resolvedChatId}`).emit("chat:ai-error", { chatId: resolvedChatId, error: err.message });
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    }
  } finally {
    if (!clientDisconnected) res.end(); // agar client already disconnect ho chuka, res.end() error dega
  }
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({
    $or: [{ user: user.id }, { "collaborators.user": user.id }],
  });

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await hasAccess(chatId, req.user.id);

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

export async function regenerateResponse(req, res) {
  const { chatId } = req.params;
  const io = getID();

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found" });
  }

  // Sabse last message dhoondo — agar wo AI ka hai, use delete karo (naya banayenge)
  const lastMessage = await messageModel.findOne({ chat: chatId }).sort({ createdAt: -1 });

  if (!lastMessage || lastMessage.role !== "ai") {
    return res.status(400).json({ message: "No AI response to regenerate" });
  }

  await messageModel.deleteOne({ _id: lastMessage._id });

  // Baaki history (jo bachi, last user-message tak) LLM ko context ke roop mein do
  const pastMessages = await messageModel
    .find({ chat: chatId })
    .select("role content -_id");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  io.to(`user:${req.user.id}`).emit("ai:thinking", { chatId });

  let fullText = "";
  let firstChunkReceived = false;
  let clientDisconnected = false;
  const abortController = new AbortController();

  req.on("close", () => {
    clientDisconnected = true;
    abortController.abort();
  });

  try {
    const stream = generateResponseStream(pastMessages, abortController.signal, chatId, req.user.customInstructions);

    for await (const chunk of stream) {
      if (clientDisconnected) break;

      if (!firstChunkReceived) {
        io.to(`user:${req.user.id}`).emit("ai:typing", { chatId });
        firstChunkReceived = true;
      }

      fullText += chunk;
      res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
    }

    if (fullText.trim()) {
      const aiMessage = await messageModel.create({
        chat: chatId,
        content: fullText,
        role: "ai",
      });

      if (!clientDisconnected) {
        io.to(`user:${req.user.id}`).emit("ai:done", { chatId });
        res.write(`data: ${JSON.stringify({ type: "done", aiMessage })}\n\n`);
      }
    }
  } catch (err) {
    if (!clientDisconnected) {
      console.error("Regenerate error:", err);
      io.to(`user:${req.user.id}`).emit("ai:error", { chatId, error: err.message });
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    }
  } finally {
    if (!clientDisconnected) res.end();
  }
}

export async function renameChat(req, res) {
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const chat = await chatModel.findOneAndUpdate(
    { _id: chatId, user: req.user.id },
    { title: title.trim() },
    { new: true },
  );

  if (!chat) {
    return res.status(404).json({ message: "chat not found" });
  }

  res.status(200).json({ message: "Chat renamed successfully", chat });
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

export async function editMessage(req, res) {
  const { chatId, messageId } = req.params;
  const { content } = req.body;
  const io = getID();

  if (!content?.trim()) {
    return res.status(400).json({ message: "Content is required" });
  }

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found" });
  }

  const targetMessage = await messageModel.findOne({ _id: messageId, chat: chatId });
  if (!targetMessage || targetMessage.role !== "user") {
    return res.status(400).json({ message: "Can only edit your own messages" });
  }

  // Edited message ka content update karo
  targetMessage.content = content.trim();
  await targetMessage.save();

  // Isके BAAD ki saari messages delete karo — purana continuation ab invalid hai
  await messageModel.deleteMany({
    chat: chatId,
    createdAt: { $gt: targetMessage.createdAt },
  });

  // Ab edited-message tak ki history LLM ko do
  const pastMessages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: 1 })
    .select("role content -_id");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  io.to(`user:${req.user.id}`).emit("ai:thinking", { chatId });

  let fullText = "";
  let firstChunkReceived = false;
  let clientDisconnected = false;
  const abortController = new AbortController();

  req.on("close", () => {
    clientDisconnected = true;
    abortController.abort();
  });

  try {
    const stream = generateResponseStream(pastMessages, abortController.signal, chatId, req.user.customInstructions);

    for await (const chunk of stream) {
      if (clientDisconnected) break;

      if (!firstChunkReceived) {
        io.to(`user:${req.user.id}`).emit("ai:typing", { chatId });
        firstChunkReceived = true;
      }

      fullText += chunk;
      res.write(`data: ${JSON.stringify({ type: "chunk", chunk })}\n\n`);
    }

    if (fullText.trim()) {
      const aiMessage = await messageModel.create({
        chat: chatId,
        content: fullText,
        role: "ai",
      });

      if (!clientDisconnected) {
        io.to(`user:${req.user.id}`).emit("ai:done", { chatId });
        res.write(`data: ${JSON.stringify({ type: "done", aiMessage })}\n\n`);
      }
    }
  } catch (err) {
    if (!clientDisconnected) {
      console.error("Edit-regenerate error:", err);
      io.to(`user:${req.user.id}`).emit("ai:error", { chatId, error: err.message });
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    }
  } finally {
    if (!clientDisconnected) res.end();
  }
}

export async function shareChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found" });
  }

  if (!chat.shareId) {
    chat.shareId = crypto.randomBytes(12).toString("hex");
  }
  chat.isPublic = true;
  await chat.save();

  res.status(200).json({ shareId: chat.shareId, isPublic: true });
}

export async function unshareChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndUpdate(
    { _id: chatId, user: req.user.id },
    { isPublic: false },
    { new: true },
  );

  if (!chat) {
    return res.status(404).json({ message: "chat not found" });
  }

  res.status(200).json({ isPublic: false });
}

// Public route — NO auth check, kyunki share-link koi bhi access kar sake
export async function getSharedChat(req, res) {
  const { shareId } = req.params;

  const chat = await chatModel.findOne({ shareId, isPublic: true });
  if (!chat) {
    return res.status(404).json({ message: "This chat is not shared or no longer available" });
  }

  const messages = await messageModel
    .find({ chat: chat._id })
    .select("role content createdAt -_id")
    .sort({ createdAt: 1 });

  res.status(200).json({ title: chat.title, messages });
}

export async function reactToMessage(req, res) {
  const { messageId } = req.params;
  const { reaction } = req.body; // "like" | "dislike" | null

  if (reaction && !["like", "dislike"].includes(reaction)) {
    return res.status(400).json({ message: "Invalid reaction" });
  }

  const message = await messageModel.findById(messageId);
  if (!message || message.role !== "ai") {
    return res.status(400).json({ message: "Can only react to AI messages" });
  }

  message.reaction = reaction;
  await message.save();

  res.status(200).json({ message: "Reaction updated", reaction: message.reaction });
}

// Helper — chat access check (owner ya collaborator dono allowed)
async function hasAccess(chatId, userId) {
  return chatModel.findOne({
    _id: chatId,
    $or: [{ user: userId }, { "collaborators.user": userId }],
  });
}

// ── Collaboration: Invite Link ──

export async function generateInviteLink(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found or you're not the owner" });
  }

  // Naya random token — agar pehle se hai to bhi regenerate ho jayega (purana link invalid)
  const token = crypto.randomBytes(20).toString("hex");
  chat.inviteToken = token;
  await chat.save();

  res.status(200).json({ inviteToken: token });
}

export async function revokeInviteLink(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found or you're not the owner" });
  }

  chat.inviteToken = null;
  await chat.save();

  res.status(200).json({ message: "Invite link revoked" });
}

export async function joinViaLink(req, res) {
  const { token } = req.params;

  const chat = await chatModel.findOne({ inviteToken: token });
  if (!chat) {
    return res.status(404).json({ message: "Invalid or expired invite link" });
  }

  // Owner khud apna link khole to seedha chat kholna hai, dobara collaborator nahi banna
  if (chat.user.toString() === req.user.id) {
    return res.status(200).json({ chatId: chat._id, alreadyMember: true });
  }

  const alreadyAdded = chat.collaborators.some((c) => c.user.toString() === req.user.id);
  if (!alreadyAdded) {
    chat.collaborators.push({ user: req.user.id });
    await chat.save();

    // Owner ko batao ki naya collaborator judа
    const io = getID();
    io.to(`user:${chat.user}`).emit("chat:collaborator-joined", {
      chatId: chat._id,
      userId: req.user.id,
    });
  }

  res.status(200).json({ chatId: chat._id, alreadyMember: alreadyAdded });
}

export async function removeCollaborator(req, res) {
  const { chatId, userId } = req.params;

  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
  if (!chat) {
    return res.status(404).json({ message: "chat not found or you're not the owner" });
  }

  chat.collaborators = chat.collaborators.filter((c) => c.user.toString() !== userId);
  await chat.save();

  res.status(200).json({ message: "Collaborator removed" });
}

export async function getCollaborators(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel
    .findOne({ _id: chatId, user: req.user.id })
    .populate("collaborators.user", "username email");

  if (!chat) {
    return res.status(404).json({ message: "chat not found or you're not the owner" });
  }

  res.status(200).json({ collaborators: chat.collaborators, inviteToken: chat.inviteToken });
}