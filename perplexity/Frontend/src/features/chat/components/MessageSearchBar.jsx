import { useEffect, useRef } from "react";
import IconEl from "./IconEl";

const MessageSearchBar = ({ query, setQuery, matchCount, activeIndex, onNext, onPrev, onClose, t }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 16,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 8px",
        borderRadius: 10,
        background: "#161616",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <IconEl name="search" size={13} color="rgba(255,255,255,0.4)" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          else if (e.key === "Enter") {
            e.preventDefault();
            e.shiftKey ? onPrev() : onNext();
          }
        }}
        placeholder="Search in chat..."
        style={{
          width: 160,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 12.5,
          color: "#fff",
          fontFamily: "inherit",
        }}
      />
      {query && (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 36, textAlign: "center" }}>
          {matchCount > 0 ? `${activeIndex + 1}/${matchCount}` : "0/0"}
        </span>
      )}
      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        aria-label="Previous match"
        style={{ background: "transparent", border: "none", cursor: matchCount ? "pointer" : "default", display: "flex", padding: 3, opacity: matchCount ? 1 : 0.3 }}
      >
        <IconEl name="menu" size={11} color="rgba(255,255,255,0.6)" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        aria-label="Next match"
        style={{ background: "transparent", border: "none", cursor: matchCount ? "pointer" : "default", display: "flex", padding: 3, opacity: matchCount ? 1 : 0.3 }}
      >
        <IconEl name="menu" size={11} color="rgba(255,255,255,0.6)" />
      </button>
      <button
        onClick={onClose}
        aria-label="Close search"
        style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: 3 }}
      >
        <IconEl name="close" size={12} color="rgba(255,255,255,0.5)" />
      </button>
    </div>
  );
};

export default MessageSearchBar;