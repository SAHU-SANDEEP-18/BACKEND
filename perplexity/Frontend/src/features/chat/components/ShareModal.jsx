import { useState } from "react";
import IconEl from "./IconEl";
import { shareChat, unshareChat } from "../service/chat.api";

const ShareModal = ({ chat, onClose, onUpdateShareStatus, t }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublic = chat?.isPublic || false;
  const shareUrl = chat?.shareId ? `${window.location.origin}/shared/${chat.shareId}` : null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isPublic) {
        await unshareChat(chat.id);
        onUpdateShareStatus({ isPublic: false });
      } else {
        const data = await shareChat(chat.id);
        onUpdateShareStatus({ isPublic: true, shareId: data.shareId });
      }
    } catch (err) {
      console.error("Share toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          maxWidth: "90vw",
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>Share chat</p>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
          Anyone with the link can view this conversation (read-only). No login required.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            marginBottom: isPublic ? 12 : 0,
          }}
        >
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>
            {isPublic ? "Anyone with link can view" : "Only you can view"}
          </span>
          <button
            onClick={handleToggle}
            disabled={loading}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              border: "none",
              background: isPublic ? t.primary : "rgba(255,255,255,0.15)",
              cursor: loading ? "wait" : "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: isPublic ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>

        {isPublic && shareUrl && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 11.5,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                padding: 4,
              }}
            >
              <IconEl name={copied ? "copyCheck" : "copy"} size={13} color={copied ? "#4ade80" : t.primary} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;