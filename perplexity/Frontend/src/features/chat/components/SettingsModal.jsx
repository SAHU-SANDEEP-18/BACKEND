import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateCustomInstructions, logout } from "../../auth/services/auth.api";
import { setUser } from "../../auth/auth.slice";
import { setTheme } from "../../theme/theme.slice";
import { THEME_OPTIONS } from "../constants";
import IconEl from "./IconEl";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Start a new chat" },
  { keys: ["Ctrl", "B"], desc: "Toggle sidebar" },
  { keys: ["Ctrl", "/"], desc: "Show shortcuts list" },
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
      background: `${t.primary}18`,
      border: `1px solid ${t.primary}44`,
      fontSize: 11,
      fontFamily: "monospace",
      color: "rgba(255,255,255,0.9)",
    }}
  >
    {label}
  </span>
);

const SettingsModal = ({ user, onClose, t, theme }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("custom_ai"); // "shortcuts" | "theme" | "custom_ai" | "logout"
  const [instructions, setInstructions] = useState(user?.customInstructions || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSaveInstructions = async () => {
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      dispatch(setUser(null));
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      dispatch(setUser(null));
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "92vw",
          height: 380,
          background: t.sidebar || "#161616",
          border: `1px solid ${t.primary}33`,
          borderRadius: 16,
          display: "flex",
          overflow: "hidden",
          boxShadow: "0 25px 70px rgba(0,0,0,0.6)",
        }}
      >
        {/* Left Tabs Sidebar */}
        <div
          style={{
            width: 160,
            background: "rgba(0,0,0,0.2)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Settings
          </div>

          <button
            onClick={() => setActiveTab("shortcuts")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "shortcuts" ? `${t.primary}22` : "transparent",
              color: activeTab === "shortcuts" ? t.primary : "rgba(255,255,255,0.7)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconEl name="fileText" size={14} color={activeTab === "shortcuts" ? t.primary : "rgba(255,255,255,0.5)"} />
            Shortcuts
          </button>

          <button
            onClick={() => setActiveTab("theme")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "theme" ? `${t.primary}22` : "transparent",
              color: activeTab === "theme" ? t.primary : "rgba(255,255,255,0.7)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconEl name="sparkles" size={14} color={activeTab === "theme" ? t.primary : "rgba(255,255,255,0.5)"} />
            Theme Changes
          </button>

          <button
            onClick={() => setActiveTab("custom_ai")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "custom_ai" ? `${t.primary}22` : "transparent",
              color: activeTab === "custom_ai" ? t.primary : "rgba(255,255,255,0.7)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconEl name="edit" size={14} color={activeTab === "custom_ai" ? t.primary : "rgba(255,255,255,0.5)"} />
            Custom AI
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setActiveTab("logout")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: activeTab === "logout" ? "rgba(239,68,68,0.2)" : "transparent",
              color: activeTab === "logout" ? "#f87171" : "rgba(239,68,68,0.75)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <IconEl name="trash" size={14} color="#f87171" />
            Logout
          </button>
        </div>

        {/* Right Content Panel */}
        <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              fontSize: 18,
            }}
          >
            ×
          </button>

          {/* Section 1: Keyboard Shortcuts */}
          {activeTab === "shortcuts" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>
                Keyboard Shortcuts
              </h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
                Quick navigation shortcuts
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", paddingRight: 4 }}>
                {SHORTCUTS.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>{s.desc}</span>
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
          )}

          {/* Section 2: Theme Changes */}
          {activeTab === "theme" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>
                Theme Preferences
              </h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
                Select your preferred accent theme color
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {THEME_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => dispatch(setTheme(opt.key))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: theme === opt.key ? `${opt.color}22` : "rgba(255,255,255,0.03)",
                      border: theme === opt.key ? `1.5px solid ${opt.color}` : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: opt.color,
                        boxShadow: theme === opt.key ? `0 0 8px ${opt.color}` : "none",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12.5, fontWeight: theme === opt.key ? 600 : 400, color: "#fff", textTransform: "capitalize" }}>
                      {opt.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Custom AI */}
          {activeTab === "custom_ai" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>
                Custom AI Instructions
              </h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>
                Instruct how AI should respond across your chats
              </p>

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="e.g. Keep answers short and direct. Prefer concise explanations."
                style={{
                  width: "100%",
                  flex: 1,
                  background: "rgba(0,0,0,0.25)",
                  border: `1px solid ${t.primary}33`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "#fff",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{instructions.length}/1000</span>
                <button
                  onClick={handleSaveInstructions}
                  disabled={saving}
                  style={{
                    fontSize: 12,
                    padding: "7px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: saved ? "#4ade80" : t.primary,
                    color: t.textOn,
                    cursor: saving ? "wait" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {saved ? "Saved!" : saving ? "Saving..." : "Save Instructions"}
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Logout */}
          {activeTab === "logout" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <IconEl name="trash" size={22} color="#f87171" />
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
                Log Out of Account?
              </h3>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", maxWidth: 260 }}>
                Logged in as <strong style={{ color: "#fff" }}>{user?.email || user?.username || "User"}</strong>. You will need to log back in to access your chats.
              </p>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: loggingOut ? "wait" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
                }}
              >
                {loggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;