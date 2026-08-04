import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCustomInstructions } from "../../auth/services/auth.api";
import { setUser } from "../../auth/auth.slice";

const SettingsModal = ({ user, onClose, t }) => {
  const dispatch = useDispatch();
  const [instructions, setInstructions] = useState(user?.customInstructions || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateCustomInstructions(instructions);
      dispatch(setUser(data.user));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Failed to save instructions:", err);
    } finally {
      setSaving(false);
    }
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
          width: 420,
          maxWidth: "90vw",
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>Custom Instructions</p>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 14px" }}>
          Tell the AI how you'd like it to respond. This applies to all your chats.
        </p>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          maxLength={1000}
          rows={6}
          placeholder="e.g. Always keep answers short and direct. Prefer Hinglish. Avoid unnecessary disclaimers."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${t.primary}33`,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12.5,
            color: "#fff",
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{instructions.length}/1000</span>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              fontSize: 12,
              padding: "7px 16px",
              borderRadius: 8,
              border: "none",
              background: saved ? "#4ade80" : t.primary,
              color: t.textOn,
              cursor: saving ? "wait" : "pointer",
              fontWeight: 500,
            }}
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;