import "dotenv/config";
import app from "./src/app.js";
import http from "http"
import connectToDB from "./src/config/database.js";
import {  initSocket } from "./src/sockets/server.socket.js"

const httpServer = http.createServer(app)
initSocket(httpServer)

connectToDB();

httpServer.listen(3000, () => {
  console.log("server is running port on 3000");
});
