import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/chats",
  withCredentials: true,
});

// Streaming version — SSE response ko manually parse karta hai
export const sendMessageStream = async ({ message, chatId, quotedText, attachments }, onEvent, signal) => {
  const response = await fetch("http://localhost:3000/api/chats/message", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chat: chatId, quotedText, attachments }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start message stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop(); // incomplete part agla read ke liye rakh do

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      const json = part.slice(6); // "data: " hata do
      try {
        const data = JSON.parse(json);
        onEvent(data);
      } catch (err) {
        console.error("Failed to parse SSE chunk:", err);
      }
    }
  }
};

export const regenerateMessageStream = async (chatId, onEvent, signal) => {
  const response = await fetch(`http://localhost:3000/api/chats/${chatId}/regenerate`, {
    method: "POST",
    credentials: "include",
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to regenerate response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      try {
        onEvent(JSON.parse(part.slice(6)));
      } catch (err) {
        console.error("Failed to parse SSE chunk:", err);
      }
    }
  }
};

export const editMessageStream = async (chatId, messageId, content, onEvent, signal) => {
  const response = await fetch(`http://localhost:3000/api/chats/${chatId}/messages/${messageId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to edit message");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      try {
        onEvent(JSON.parse(part.slice(6)));
      } catch (err) {
        console.error("Failed to parse SSE chunk:", err);
      }
    }
  }
};

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.attachments;
};

export const getChats = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getMessages = async (chatId) => {
  const response = await api.get(`/${chatId}/messages`);
  return response.data;
};

export const renameChat = async (chatId, title) => {
  const response = await api.put(`/${chatId}/title`, { title });
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/delete/${chatId}`);
  return response.data;
};