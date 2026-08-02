const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Start a new chat" },
  { keys: ["Ctrl", "B"], desc: "Toggle sidebar" },
  { keys: ["Ctrl", "/"], desc: "Show this shortcuts list" },
  { keys: ["Esc"], desc: "Close modal / cancel editing" },
  { keys: ["Enter"], desc: "Send message" },
  { keys: ["Shift", "Enter"], desc: "New line in message" },
];

const Key = ({ label, t }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 7px",
      borderRadius: 5,
      background: `${t.primary}15`,
      border: `1px solid ${t.primary}44`,
      fontSize: 11,
      fontFamily: "monospace",
      color: "rgba(255,255,255,0.9)",
    }}
  >
    {label}
  </span>
);

const ShortcutsModal = ({ onClose, t }) => (
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
        width: 340,
        maxWidth: "90vw",
        background: "#161616",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff", borderLeft: `3px solid ${t.primary}`, paddingLeft: 10 }}>
          Keyboard Shortcuts
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            fontSize: 16,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SHORTCUTS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>{s.desc}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {s.keys.map((k, ki) => (
                <span key={ki} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Key label={k} t={t} />
                  {ki < s.keys.length - 1 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>+</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ShortcutsModal;