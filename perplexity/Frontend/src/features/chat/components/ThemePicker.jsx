import { useState, useRef, useEffect } from "react";
import { THEME_OPTIONS } from "../constants";

const ThemePicker = ({ theme, dispatch, setThemeAction, t }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeColor = THEME_OPTIONS.find((o) => o.key === theme)?.color || t.primary;

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Change theme"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "transparent",
          border: `2px solid ${activeColor}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: "50%", background: activeColor }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            bottom: 0,
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 10,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            zIndex: 60,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                dispatch(setThemeAction(opt.key));
                setOpen(false);
              }}
              aria-label={opt.key}
              title={opt.key}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: opt.color,
                border: theme === opt.key ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                boxShadow: theme === opt.key ? `0 0 8px ${opt.color}99` : "none",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;