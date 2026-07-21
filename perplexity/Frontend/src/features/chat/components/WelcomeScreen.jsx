import IconEl from "./IconEl";
import { SUGGESTIONS } from "../constants";

const WelcomeScreen = ({ t, greeting, userName, onSuggestionClick }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 24px 0",
      overflowY: "auto",
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: t.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <IconEl name="sparkles" size={28} color={t.textOn} />
    </div>
    <p style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: "0 0 6px", textAlign: "center" }}>
      {greeting}, {userName} 👋
    </p>
    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 28px", textAlign: "center" }}>
      What would you like to work on today?
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 8,
        width: "100%",
        maxWidth: 500,
      }}
    >
      {SUGGESTIONS.map((s) => (
        <div
          key={s.label}
          onClick={() => onSuggestionClick(s.label)}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            cursor: "pointer",
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${t.primary}12`;
            e.currentTarget.style.borderColor = `${t.primary}44`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: `${t.primary}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <IconEl name={s.icon} size={15} color={t.primary} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: t.primary, margin: "0 0 3px" }}>{s.label}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default WelcomeScreen;