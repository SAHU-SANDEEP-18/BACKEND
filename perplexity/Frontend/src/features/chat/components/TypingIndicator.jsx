const TypingIndicator = ({ t }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
        fontSize: 9,
        fontWeight: 700,
        color: t.textOn,
        letterSpacing: 0.3,
        animation: "nexus-pulse 1.5s ease-in-out infinite",
      }}
    >
      AI
    </div>
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "4px 16px 16px 16px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Thinking...</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: t.primary,
              animation: `nexus-bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator;