import { useRef } from "react";
import IconEl from "./IconEl";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { detectLanguage } from "../constants";

const PASTE_THRESHOLD = 300;
const MAX_FILES = 4;

const ChatInput = ({
  message,
  setMessage,
  onSend,
  onStop,
  isLoading,
  isUploading,
  t,
  quotedText,
  onClearQuote,
  pastedContent,
  setPastedContent,
  attachedFiles,
  setAttachedFiles,
}) => {
  const fileInputRef = useRef(null);

  const addFiles = (newFiles) => {
    setAttachedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > MAX_FILES) {
        alert(`Maximum ${MAX_FILES} files allowed`);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  };

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(
      files.map((file) => ({
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    );
    e.target.value = "";
  };

  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        addFiles([{ file, previewUrl: URL.createObjectURL(file) }]);
      }
      return;
    }

    const text = e.clipboardData.getData("text");
    const isLarge = text.length > PASTE_THRESHOLD || text.split("\n").length > 6;

    if (isLarge) {
      e.preventDefault();
      setPastedContent({ text, language: detectLanguage(text) });
    }
  };

  const hasContent = message.trim() || pastedContent || attachedFiles.length > 0;
  const sendBlocked = isUploading; // upload ke dauraan send bilkul allow nahi

  return (
    <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
      {quotedText && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "8px 10px",
            marginBottom: 8,
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${t.primary}44`,
            borderLeft: `2px solid ${t.primary}`,
          }}
        >
          <div
            style={{
              flex: 1,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              fontStyle: "italic",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {quotedText}
          </div>
          <button
            onClick={onClearQuote}
            aria-label="Remove quote"
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexShrink: 0, padding: 2 }}
          >
            <IconEl name="close" size={13} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
      )}

      {attachedFiles.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {attachedFiles.map((item, i) => (
            <div key={i} style={{ position: "relative", width: 56, height: 56 }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.previewUrl ? (
                  <img src={item.previewUrl} alt={item.file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <IconEl name="fileText" size={18} color={t.primary} />
                    <span
                      style={{
                        fontSize: 8,
                        color: "rgba(255,255,255,0.5)",
                        textAlign: "center",
                        padding: "2px 3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%",
                      }}
                    >
                      {item.file.name}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove file"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#222",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  zIndex: 2,
                }}
              >
                <IconEl name="close" size={9} color="rgba(255,255,255,0.7)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pastedContent && (
        <div
          style={{
            position: "relative",
            marginBottom: 8,
            maxWidth: 240,
          }}
        >
          <button
            onClick={() => setPastedContent(null)}
            aria-label="Remove pasted content"
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#222",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 2,
            }}
          >
            <IconEl name="close" size={10} color="rgba(255,255,255,0.6)" />
          </button>

          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ maxHeight: 130, overflow: "hidden", position: "relative", background: "#0d0d0d" }}>
            <SyntaxHighlighter
              language={pastedContent.language}
              style={oneDark}
              customStyle={{ margin: 0, padding: "10px 12px", fontSize: 10.5, background: "#0d0d0d" }}
              codeTagProps={{ style: { fontFamily: "monospace" } }}
            >
              {pastedContent.text.slice(0, 800)}
            </SyntaxHighlighter>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 30,
                background: "linear-gradient(transparent, #0d0d0d)",
              }}
            />
          </div>

          <div style={{ padding: "6px 10px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: t.primary }}>PASTED</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{pastedContent.language}</span>
          </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.09)",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = `${t.primary}55`)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sendBlocked) void onSend();
            }
          }}
          placeholder={pastedContent || attachedFiles.length > 0 ? "Add a message..." : "Ask me anything..."}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#fff",
            fontFamily: "inherit",
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.docx"
          style={{ display: "none" }}
          onChange={handleFilePick}
        />
        <button
          aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 28,
            height: 28,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconEl name="clip" size={15} color="rgba(255,255,255,0.3)" />
        </button>

        <button
          aria-label="Voice input"
          style={{
            width: 28,
            height: 28,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconEl name="mic" size={15} color="rgba(255,255,255,0.3)" />
        </button>

        {isLoading ? (
          <button
            onClick={onStop}
            aria-label="Stop generating"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              backgroundColor: t.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: t.textOn }} />
          </button>
        ) : (
          <button
            onClick={() => !sendBlocked && void onSend()}
            disabled={!hasContent || sendBlocked}
            aria-label="Send message"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              border: "none",
              cursor: hasContent && !sendBlocked ? "pointer" : "not-allowed",
              backgroundColor: hasContent && !sendBlocked ? t.primary : "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {isUploading ? (
              <div
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,0.25)",
                  borderTopColor: t.primary,
                  borderRadius: "50%",
                  animation: "nexus-spin 0.7s linear infinite",
                }}
              />
            ) : (
              <IconEl name="arrowUp" size={16} color={hasContent ? t.textOn : "rgba(255,255,255,0.3)"} />
            )}
          </button>
        )}
      </div>
      <p style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
        {isUploading ? "Uploading attachment..." : "Nexus may make mistakes. Verify important information."}
      </p>
    </div>
  );
};

export default ChatInput;