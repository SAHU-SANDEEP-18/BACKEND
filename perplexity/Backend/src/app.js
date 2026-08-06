import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import folderRouter from "./routes/folder.route.js"
import morgan from "morgan";
import cors from "cors"
const app = express();

// Middleware
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
app.use("/api/chats", chatRouter)
app.use("/api/folders", folderRouter);
export default app;
