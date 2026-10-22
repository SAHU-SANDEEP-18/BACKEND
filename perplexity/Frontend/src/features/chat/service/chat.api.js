import axios from "axios";
import { apiUrl } from "../../../config/api";

const api = axios.create({
  baseURL: apiUrl("/api/chats"),
  withCredentials: true,
});

// Streaming version — SSE response ko manually parse karta hai
export const sendMessageStream = async ({ message, chatId, quotedText, attachments }, onEvent, signal) => {
  const response = await fetch(apiUrl("/api/chats/message"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chat: chatId, quotedText, attachments }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    let errorMessage = `Failed to start message stream (${response.status})`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
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
  const response = await fetch(apiUrl(`/api/chats/${chatId}/regenerate`), {
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
  const response = await fetch(apiUrl(`/api/chats/${chatId}/messages/${messageId}`), {
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

export const shareChat = async (chatId) => {
  const response = await api.post(`/${chatId}/share`);
  return response.data;
};

export const unshareChat = async (chatId) => {
  const response = await api.post(`/${chatId}/unshare`);
  return response.data;
};

export const getSharedChat = async (shareId) => {
  const response = await api.get(`/shared/${shareId}`);
  return response.data;
};

export const reactToMessage = async (messageId, reaction) => {
  const response = await api.put(`/messages/${messageId}/reaction`, { reaction });
  return response.data;
};

export const generateInviteLink = async (chatId) => {
  const response = await api.post(`/${chatId}/invite-link`);
  return response.data; // { inviteToken }
};

export const revokeInviteLink = async (chatId) => {
  const response = await api.delete(`/${chatId}/invite-link`);
  return response.data;
};

export const joinViaLink = async (token) => {
  const response = await axios.post(apiUrl(`/api/join/${token}`), null, {
    withCredentials: true,
  });
  return response.data; // { chatId, alreadyMember }
};

export const removeCollaborator = async (chatId, userId) => {
  const response = await api.delete(`/${chatId}/collaborators/${userId}`);
  return response.data;
};

export const getCollaborators = async (chatId) => {
  const response = await api.get(`/${chatId}/collaborators`);
  return response.data; // { collaborators, inviteToken }
};