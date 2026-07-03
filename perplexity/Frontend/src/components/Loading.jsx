import React from "react";
import { useSelector } from "react-redux";
import { THEMES } from "../config/themes";

const Loading = ({ message = "Loading..." }) => {
  const themeKey = useSelector((state) => state.theme?.theme || "teal");
  const t = THEMES[themeKey] || THEMES.teal;

  return (
    <section
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.textOn,
        padding: "1rem 1rem 2.5rem",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          minHeight: "85vh",
          width: "100%",
          maxWidth: "28rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            borderRadius: "1.5rem",
            border: `1px solid ${t.primary}33`,
            background: `${t.sidebar}CC`,
            padding: "2rem",
            boxShadow: `0 20px 45px ${t.primary}22`,
          }}
        >
          <div
            style={{
              height: "4rem",
              width: "4rem",
              borderRadius: "999px",
              border: `4px solid ${t.primary}33`,
              borderTopColor: t.primary,
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: "1rem", fontWeight: 500, color: t.textOn }}>
            {message}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default Loading;
