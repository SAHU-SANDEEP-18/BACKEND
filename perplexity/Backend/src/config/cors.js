const configuredFrontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const allowedOrigins = [
  "http://localhost:5173",
  "https://lucky-mooncake-28dd6a.netlify.app",
  "https://aichatbot-fds.netlify.app",
  ...configuredFrontendUrls,
].filter(Boolean);
