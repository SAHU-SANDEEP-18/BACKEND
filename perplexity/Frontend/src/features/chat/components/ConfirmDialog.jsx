const ConfirmDialog = ({ title, message, onConfirm, onCancel, t }) => (
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
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 320,
        maxWidth: "90vw",
        background: "#161616",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#fff" }}>
        {title}
      </p>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            fontSize: 12,
            padding: "7px 14px",
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.75)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            fontSize: 12,
            padding: "7px 14px",
            borderRadius: 8,
            border: "none",
            background: "#e5484d",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;