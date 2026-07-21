import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IconEl from "./IconEl";

const MessageBubble = React.memo(function MessageBubble({ msg, t, userName, mdComponents }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.primary}, ${t.primary}88)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
            fontSize: 9,
            fontWeight: 700,
            color: t.textOn,
            letterSpacing: 0.3,
            animation: "nexus-pulse 3s ease-in-out infinite",
          }}
        >
          AI
        </div>
      )}

      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser ? `${t.primary}22` : "rgba(255,255,255,0.05)",
          border: isUser ? `1px solid ${t.primary}33` : "1px solid rgba(255,255,255,0.07)",
          color: "#fff",
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
            {msg.content}
          </p>
        ) : (
          <>
            <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
            {msg.streaming && (
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 14,
                  background: t.primary,
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                  animation: "nexus-blink 1s infinite",
                }}
              />
            )}
          </>
        )}
      </div>

      {isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: t.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
            fontSize: 10,
            fontWeight: 600,
            color: t.textOn,
          }}
        >
          {userName.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
});

export default MessageBubble;