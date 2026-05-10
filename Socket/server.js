import app from "./src/app.js";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  /* options */
});

io.on("connection", (socket) => {
  console.log("new connection created");

  socket.on("message", (data) => {
    console.log("User has sent a message", data);
  });
});

httpServer.listen(3000, () => {
  console.log("server is running on port 3000");
});
