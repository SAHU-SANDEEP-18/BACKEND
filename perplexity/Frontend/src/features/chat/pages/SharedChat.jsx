import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSharedChat } from "../service/chat.api";
import { THEMES } from "../../../config/themes";

const SharedChat = () => {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const t = THEMES.teal;

  useEffect(() => {
    (async () => {
      try {
        const res = await getSharedChat(shareId);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || "This chat is not available");
      }
    })();
  }, [shareId]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, color: "rgba(255,255,255,0.6)" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, color: "rgba(255,255,255,0.4)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
          Shared conversation — read only
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 24, textAlign: "center" }}>
          {data.title}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: msg.role === "user" ? `${t.primary}22` : "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 13,
              }}
            >
              {msg.role === "user" ? (
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedChat;