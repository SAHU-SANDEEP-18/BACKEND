import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IconEl from "./IconEl";

const MessageBubble = React.memo(function MessageBubble({
  msg,
  t,
  userName,
  mdComponents,
  isLast,
  onRegenerate,
  onEdit, // (newContent) => void
  onReply, // (selectedText) => void
  searchQuery, // agar set hai, matching-text highlight hoga
  isActiveMatch, // ye message currently "active" search-result hai
  messageRef, // scroll-into-view ke liye ref
}) {
  const isUser = msg.role === "user";
  const showRegenerate = !isUser && isLast && !msg.streaming;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.content);
  const [copied, setCopied] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState(null); // { x, y, text }
  const contentRef = useRef(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || !contentRef.current) {
      setSelectionPopup(null);
      return;
    }

    // Confirm selection isی bubble ke andar hai (na ki page ke kisी aur hisse mein)
    const anchorNode = selection.anchorNode;
    if (!contentRef.current.contains(anchorNode)) {
      setSelectionPopup(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    setSelectionPopup({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      text,
    });
  };

  const handleReplyClick = () => {
    if (selectionPopup?.text) {
      onReply(selectionPopup.text);
    }
    window.getSelection()?.removeAllRanges();
    setSelectionPopup(null);
  };

  const highlightText = (text) => {
    if (!searchQuery?.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: isActiveMatch ? t.primary : `${t.primary}55`,
            color: isActiveMatch ? t.textOn : "#fff",
            borderRadius: 2,
            padding: "0 1px",
          }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== msg.content) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(msg.content);
    setIsEditing(false);
  };

  return (
    <div
      ref={messageRef}
      className="message-row"
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

      <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-end", maxWidth: "75%" }}>
        <div
          ref={contentRef}
          onMouseUp={handleMouseUp}
          style={{
            position: "relative",
            padding: "10px 14px",
            borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isUser ? `${t.primary}22` : "rgba(255,255,255,0.05)",
            border: isUser ? `1px solid ${t.primary}33` : "1px solid rgba(255,255,255,0.07)",
            color: "#fff",
            minWidth: isEditing ? 260 : "auto",
          }}
        >
          {/* Floating Reply popup — jahan text select hua wahi dikhta hai */}
          {selectionPopup && (
            <button
              onMouseDown={(e) => e.preventDefault()} // taaki selection clear na ho click se pehle
              onClick={handleReplyClick}
              style={{
                position: "absolute",
                left: selectionPopup.x,
                top: selectionPopup.y - 34,
                transform: "translateX(-50%)",
                background: "#1a1a1a",
                border: `1px solid ${t.primary}55`,
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 11,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              <IconEl name="reply" size={12} color={t.primary} />
              Reply
            </button>
          )}

          {/* Agar ye message khud kisi ko reply thi, quote dikhao */}
          {msg.quotedText && (
            <div
              style={{
                borderLeft: `2px solid ${t.primary}77`,
                paddingLeft: 8,
                marginBottom: 6,
                fontSize: 11.5,
                color: "rgba(255,255,255,0.5)",
                fontStyle: "italic",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {msg.quotedText}
            </div>
          )}

          {isUser &&
            !isEditing && msg.attachments?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: msg.content ? 8 : 0 }}>
                {msg.attachments.map((att, i) =>
                  att.kind === "image" ? (
                    <img
                      key={i}
                      src={att.url}
                      alt={att.name}
                      style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }}
                    />
                  ) : (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.08)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                      }}
                    >
                      <IconEl name="fileText" size={12} color={t.primary} />
                      {att.name}
                    </a>
                  ),
                )}
              </div>
            )}
          {isUser ? (
            isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  rows={Math.min(6, Math.max(2, editValue.split("\n").length))}
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${t.primary}55`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 13,
                    color: "#fff",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      handleCancelEdit();
                    }
                  }}
                />
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: t.primary,
                      color: t.textOn,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {searchQuery ? highlightText(msg.content) : msg.content}
              </p>
            )
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

        {/* Copy + Regenerate — bubble ke neeche, icon-only buttons */}
        {!isUser && !msg.streaming && (
          <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
            <button
              onClick={handleCopy}
              aria-label="Copy response"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 6,
                flexShrink: 0,
                opacity: copied ? 1 : 0.4,
                transition: "opacity 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.opacity = 0.4;
              }}
            >
              <IconEl name={copied ? "copyCheck" : "copy"} size={12} color={copied ? "#4ade80" : "rgba(255,255,255,0.6)"} />
            </button>

            {showRegenerate && (
              <button
                onClick={onRegenerate}
                aria-label="Regenerate response"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  flexShrink: 0,
                  opacity: 0.4,
                  transition: "opacity 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.4)}
              >
                <IconEl name="reload" size={12} color="rgba(255,255,255,0.6)" />
              </button>
            )}
          </div>
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

      {/* Edit — sirf user-messages pe, hover pe dikhta hai */}
      {isUser && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          aria-label="Edit message"
          className="edit-btn"
          style={{
            alignSelf: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            flexShrink: 0,
            opacity: 0,
            transition: "opacity 0.15s",
          }}
        >
          <IconEl name="pencil" size={12} color="rgba(255,255,255,0.5)" />
        </button>
      )}
    </div>
  );
});

export default MessageBubble;