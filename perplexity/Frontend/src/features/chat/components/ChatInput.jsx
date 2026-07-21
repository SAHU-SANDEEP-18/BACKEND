import IconEl from "./IconEl";

const ChatInput = ({ message, setMessage, onSend, isLoading, t }) => (
  <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void onSend();
          }
        }}
        placeholder="Ask me anything..."
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
      <button
        aria-label="Attach file"
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
      <button
        onClick={() => void onSend()}
        disabled={isLoading || !message.trim()}
        aria-label="Send message"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: "none",
          cursor: message.trim() && !isLoading ? "pointer" : "not-allowed",
          backgroundColor: message.trim() && !isLoading ? t.primary : "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <IconEl
          name="arrowUp"
          size={16}
          color={message.trim() && !isLoading ? t.textOn : "rgba(255,255,255,0.3)"}
        />
      </button>
    </div>
    <p style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.15)" }}>
      Nexus may make mistakes. Verify important information.
    </p>
  </div>
);

export default ChatInput;