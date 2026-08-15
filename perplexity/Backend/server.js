import "./instrument.js"; // Sentry — sabse pehle import hona chahiye, kisi aur cheez se pehle
import "dotenv/config";
import app from "./src/app.js";
import http from "http"
import connectToDB from "./src/config/database.js";
import {  initSocket } from "./src/sockets/server.socket.js"
import * as Sentry from "@sentry/node";

// Safety net — agar koi background promise (jaise ek stopped/regenerated stream ka
// leftover cleanup) unhandled error de, poora server crash na ho, sirf log ho jaye.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  Sentry.captureException(reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  Sentry.captureException(err);
});

const httpServer = http.createServer(app)
initSocket(httpServer)

connectToDB();

httpServer.listen(3000, () => {
  console.log("server is running port on 3000");
});
