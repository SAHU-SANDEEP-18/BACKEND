import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("Socket.io server is RUNNING");

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    try {
      const rawCookies = socket.handshake.headers.cookie;
      const parsed = rawCookies ? cookie.parse(rawCookies) : {};
      const token = parsed.token;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user:${decoded.id}`);
        console.log(`Socket ${socket.id} joined room user:${decoded.id}`);
      }
    } catch (err) {
      console.log("Socket auth failed:", err.message);
    }

    socket.on("chat:join", async (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on("chat:leave", (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
}

export function getID() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}