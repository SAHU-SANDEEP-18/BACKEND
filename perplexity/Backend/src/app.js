import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import folderRouter from "./routes/folder.route.js";
import { authUser } from "./middlewares/auth.middleware.js";
import { joinViaLink } from "./controllers/chat.controller.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // taaki ImageKit-images load ho sakein frontend mein
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

// Routes
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.post("/api/join/:token", authUser, joinViaLink);
app.use("/api/folders", folderRouter);

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
