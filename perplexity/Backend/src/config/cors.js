const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

export const allowedOrigins = [
  "http://localhost:5173",
  "aichatbot-fds.netlify.app",
  frontendUrl,
].filter(Boolean);
