import { useState, useEffect } from "react";
import IconEl from "./IconEl";
import { generateInviteLink, revokeInviteLink, removeCollaborator, getCollaborators } from "../service/chat.api";

const CollaboratorsModal = ({ chatId, onClose, t }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [inviteToken, setInviteToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCollaborators(chatId);
        setCollaborators(data.collaborators || []);
        setInviteToken(data.inviteToken || null);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  const inviteLink = inviteToken ? `${window.location.origin}/join/${inviteToken}` : null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateInviteLink(chatId);
      setInviteToken(data.inviteToken);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeInviteLink(chatId);
      setInviteToken(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRemove = async (userId) => {
    try {
      await removeCollaborator(chatId, userId);
      setCollaborators((prev) => prev.filter((c) => c.user._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 400, maxWidth: "90vw", background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>Collaborators</p>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>×</button>
        </div>

        {inviteLink ? (
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              readOnly
              value={inviteLink}
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${t.primary}33`, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "rgba(255,255,255,0.8)", outline: "none" }}
            />
            <button
              onClick={handleCopy}
              style={{ padding: "0 14px", borderRadius: 8, border: "none", background: t.primary, color: t.textOn, cursor: "pointer", fontSize: 12.5, fontWeight: 500 }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: t.primary, color: t.textOn, cursor: "pointer", fontSize: 12.5, fontWeight: 500, marginBottom: 8 }}
          >
            Generate Invite Link
          </button>
        )}

        {inviteLink && (
          <button
            onClick={handleRevoke}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 11.5, color: "rgba(255,120,120,0.7)", padding: 0, marginBottom: 14 }}
          >
            Revoke link
          </button>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {collaborators.length === 0 ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No collaborators yet.</p>
          ) : (
            collaborators.map((c) => (
              <div key={c.user._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{c.user.email}</span>
                <button
                  onClick={() => handleRemove(c.user._id)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
                >
                  <IconEl name="trash" size={12} color="rgba(255,120,120,0.7)" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsModal;