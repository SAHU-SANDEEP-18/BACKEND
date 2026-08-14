import { io } from "socket.io-client";

let socket = null;

export const initializeSocketConnection = () => {
  if (socket) return socket; // already connected hai toh dobara mat banao

  socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.io server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.io server");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocketConnection first.");
  }
  return socket;
};

export const joinChatRoom = (chatId) => {
  const socket = getSocket();
  socket.emit("chat:join", chatId);
};

export const leaveChatRoom = (chatId) => {
  const socket = getSocket();
  socket.emit("chat:leave", chatId);
};