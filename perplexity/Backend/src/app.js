import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import folderRouter from "./routes/folder.route.js";
import imageRouter from "./routes/image.route.js";
import deckRouter from "./routes/deck.route.js";
import { authUser } from "./middlewares/auth.middleware.js";
import { joinViaLink } from "./controllers/chat.controller.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { allowedOrigins } from "./config/cors.js";
const app = express();
const frontendDistPath = fileURLToPath(new URL("../public/dist/", import.meta.url));

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // taaki ImageKit-images load ho sakein frontend mein
    contentSecurityPolicy: {
      directives: {
        connectSrc: ["'self'", "https://*.ingest.us.sentry.io"],
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}))

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.post("/api/join/:token", authUser, joinViaLink);
app.use("/api/folders", folderRouter);
app.use("/api/images/", imageRouter)
app.use("/api/decks", deckRouter);

app.use(express.static(frontendDistPath));
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(join(frontendDistPath, "index.html"));
});

// Sentry — routes ke baad, kisi bhi custom error-middleware se pehle
Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  Sentry.captureException(err);
  console.error("Captured by Sentry error middleware:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
