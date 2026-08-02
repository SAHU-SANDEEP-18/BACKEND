const POSITION_STYLES = {
  top: { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
  bottom: { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
  right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
};

const Tooltip = ({ text, children, position = "top", t }) => (
  <div style={{ position: "relative", display: "inline-flex" }} className="nexus-tooltip-wrapper">
    {children}
    <span
      className="nexus-tooltip-text"
      style={{
        position: "absolute",
        ...POSITION_STYLES[position],
        background: "#1a1a1a",
        border: `1px solid ${t?.primary || "rgba(255,255,255,0.12)"}55`,
        color: "rgba(255,255,255,0.9)",
        fontSize: 11,
        padding: "4px 8px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 0.15s",
        zIndex: 50,
        boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
      }}
    >
      {text}
    </span>
  </div>
);

export default Tooltip;