export const THEME_OPTIONS = [
  { key: "teal", color: "#31B8C6" },
  { key: "green", color: "#AED934" },
  { key: "orange", color: "#FDAB69" },
  { key: "mono", color: "#FFFFFF" },
];

export const NAV_ITEMS = [
  { icon: "message", label: "Chats", key: "chats" },
  { icon: "compass", label: "Explore", key: "explore" },
  { icon: "folder", label: "Files", key: "files" },
  { icon: "plug", label: "Plugins", key: "plugins" },
];

export const SUGGESTIONS = [
  { icon: "pencil", label: "Write", desc: "Draft emails, docs, proposals" },
  { icon: "code", label: "Code", desc: "Debug, review, or generate" },
  { icon: "bulb", label: "Brainstorm", desc: "Ideas, plans, strategies" },
  { icon: "chart", label: "Analyze", desc: "Data, reports, summaries" },
  { icon: "lang", label: "Translate", desc: "Any language, any tone" },
  { icon: "book", label: "Learn", desc: "Explain any topic simply" },
];

// Bahut simple heuristic — paste ki gayi text dekh ke guess karta hai konsi language hai,
// taaki "Pasted" card mein syntax-highlighting sahi color-scheme use kare
export const detectLanguage = (text) => {
  const sample = text.slice(0, 500);

  if (/^\s*(import|export)\s.+from\s|=>|const\s+\w+\s*=|interface\s+\w+/.test(sample)) {
    return /:\s*(string|number|boolean|void)\b/.test(sample) ? "typescript" : "javascript";
  }
  if (/def\s+\w+\(/.test(sample)) {
    return "python";
  }
  if (/<\/?[a-z][\s\S]*>/i.test(sample) && /<html|<div|<body|<span/i.test(sample)) {
    return "html";
  }
  if (/^\s*[.#][\w-]+\s*{|@media|:\s*[\w-]+;\s*$/m.test(sample)) {
    return "css";
  }
  if (/public\s+(class|static)|System\.out\.println/.test(sample)) {
    return "java";
  }
  if (/^\s*#include|int\s+main\s*\(/.test(sample)) {
    return "cpp";
  }
  if (/^\s*{[\s\S]*}\s*$/.test(sample.trim()) && /"[\w]+"\s*:/.test(sample)) {
    return "json";
  }
  return "text";
};