import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import IconEl from "./IconEl";

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", margin: "10px 0", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "capitalize" }}>
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", fontSize: 12, padding: "3px 6px" }}
        >
          <IconEl name={copied ? "sparkles" : "clip"} size={12} color="rgba(255,255,255,0.45)" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "14px", fontSize: 12.5, background: "#0d0d0d" }}
        codeTagProps={{ style: { fontFamily: "monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;