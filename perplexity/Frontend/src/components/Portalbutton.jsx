import { useState } from "react";

export default function PortalButton({
  text = "LOG IN TO PORTAL",
  bgColor = "#1e3a32",
  arrowBg = "#163028",
  textColor = "#c8e6d0",
  arrowColor = "#c8e6d0",
  dividerColor = "#4a7c6a",
  width = "320px",
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  const H = 52;
  const W = 320;
  const rightW = 68;
  const slant = 12;

  // x positions of diagonal
  const x1 = W - rightW - slant; // top of divider
  const x2 = W - rightW + slant; // bottom of divider

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width,
        height: `${H}px`,
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Left background */}
        <polygon
          points={`0,0 ${x1},0 ${x2},${H} 0,${H}`}
          fill={bgColor}
          style={{ filter: hovered ? "brightness(1.1)" : "none", transition: "filter 0.2s" }}
        />
        {/* Right background */}
        <polygon
          points={`${x1},0 ${W},0 ${W},${H} ${x2},${H}`}
          fill={arrowBg}
          style={{ filter: hovered ? "brightness(1.12)" : "none", transition: "filter 0.2s" }}
        />
        {/* Divider line — single line, no gap */}
        <line x1={x1} y1={0} x2={x2} y2={H} stroke={dividerColor} strokeWidth="1.2" />
      </svg>

      {/* Text — absolute over SVG */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: `${rightW}px`,
        pointerEvents: "none",
      }}>
        <span style={{
          color: textColor,
          fontFamily: "'Arial', sans-serif",
          fontWeight: "700",
          fontSize: "13px",
          letterSpacing: "0.13em",
          whiteSpace: "nowrap",
        }}>
          {text}
        </span>
      </div>

      {/* Arrow — absolute over SVG */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "22px",
        pointerEvents: "none",
      }}>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          style={{
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M3 10H17M17 10L11 4M17 10L11 16"
            stroke={arrowColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}