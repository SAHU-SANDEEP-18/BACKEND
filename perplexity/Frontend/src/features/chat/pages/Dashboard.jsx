import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../hook/useChat";
import { THEMES } from "../../../config/themes";
import { setcurrentChatId } from "../chat.slice";
import { setTheme } from "../../theme/theme.slice";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// ─── SVG Icons ───────────────────────────────────────────────────────
const Icons = {
  sparkles: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
    </svg>
  ),
  message: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  compass: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  folder: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  plug: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M7 17l-4 4M17 7l4-4M8 3v4M16 3v4M3 8h4M13 8h4M8 13h4M8 16h8" />
    </svg>
  ),
  settings: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  edit: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  search: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  dots: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  ),
  share: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  ),
  clip: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  mic: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  arrowUp: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  menu: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  plus: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  pencil: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  code: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  bulb: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  ),
  chart: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  lang: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  book: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
};

const THEME_OPTIONS = [
  { key: "teal", color: "#31B8C6" },
  { key: "green", color: "#AED934" },
  { key: "orange", color: "#FDAB69" },
  { key: "mono", color: "#FFFFFF" },
];

const NAV_ITEMS = [
  { icon: "message", label: "Chats", key: "chats" },
  { icon: "compass", label: "Explore", key: "explore" },
  { icon: "folder", label: "Files", key: "files" },
  { icon: "plug", label: "Plugins", key: "plugins" },
];

const SUGGESTIONS = [
  { icon: "pencil", label: "Write", desc: "Draft emails, docs, proposals" },
  { icon: "code", label: "Code", desc: "Debug, review, or generate" },
  { icon: "bulb", label: "Brainstorm", desc: "Ideas, plans, strategies" },
  { icon: "chart", label: "Analyze", desc: "Data, reports, summaries" },
  { icon: "lang", label: "Translate", desc: "Any language, any tone" },
  { icon: "book", label: "Learn", desc: "Explain any topic simply" },
];

// ─── IconEl ──────────────────────────────────────────────────────────
const IconEl = ({ name, size = 18, color = "currentColor" }) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    {Icons[name]}
  </span>
);

// ─── CodeBlock ───────────────────────────────────────────────────────
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', margin: '10px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', textTransform: 'capitalize' }}>
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 12, padding: '3px 6px' }}
        >
          <IconEl name={copied ? 'sparkles' : 'clip'} size={12} color="rgba(255,255,255,0.45)" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '14px', fontSize: 12.5, background: '#0d0d0d' }}
        codeTagProps={{ style: { fontFamily: 'monospace' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────

const Sidebar = ({
  t,
  theme,
  dispatch,
  chatList,
  currentChatId,
  activeNav,
  setActiveNav,
  onSelectChat,
  onNewChat,
  onClose,
}) => (
  <div style={{ display: "flex", height: "100%" }}>
    {/* Icon Rail */}
    <div
      style={{
        width: 56,
        backgroundColor: t.sidebar,
        borderRight: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 4,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: t.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          flexShrink: 0,
        }}
      >
        <IconEl name="sparkles" size={16} color={t.textOn} />
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveNav(item.key)}
          aria-label={item.label}
          style={{
            position: "relative",
            width: 40,
            height: 40,
            borderRadius: 10,
            background:
              activeNav === item.key ? `${t.primary}22` : "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {activeNav === item.key && (
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 20,
                backgroundColor: t.primary,
                borderRadius: "0 3px 3px 0",
              }}
            />
          )}
          <IconEl
            name={item.icon}
            size={18}
            color={activeNav === item.key ? t.primary : "rgba(255,255,255,0.3)"}
          />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Theme switcher dots */}
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => dispatch(setTheme(opt.key))}
          aria-label={`${opt.key} theme`}
          style={{
            width: theme === opt.key ? 20 : 14,
            height: theme === opt.key ? 20 : 14,
            borderRadius: "50%",
            backgroundColor: opt.color,
            border:
              theme === opt.key ? "2px solid #fff" : "2px solid transparent",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.2s",
            boxShadow: theme === opt.key ? `0 0 8px ${opt.color}99` : "none",
            marginBottom: 4,
            flexShrink: 0,
          }}
        />
      ))}

      {/* Settings */}
      <button
        aria-label="Settings"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
        }}
      >
        <IconEl name="settings" size={18} color="rgba(255,255,255,0.3)" />
      </button>
    </div>

    {/* Chat list panel */}
    <div
      style={{
        width: 220,
        backgroundColor: t.sidebar,
        borderRight: "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 12px 10px",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Chats
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={onNewChat}
            aria-label="New chat"
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              backgroundColor: `${t.primary}22`,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconEl name="plus" size={14} color={t.primary} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconEl name="close" size={14} color="rgba(255,255,255,0.5)" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          margin: "0 12px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.07)",
        }}
      >
        <IconEl name="search" size={13} color="rgba(255,255,255,0.25)" />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          Search...
        </span>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chatList.length ? (
          chatList.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
                onClose?.();
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderLeft: `2px solid ${currentChatId === chat.id ? t.primary : "transparent"}`,
                background:
                  currentChatId === chat.id ? `${t.primary}12` : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (currentChatId !== chat.id)
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (currentChatId !== chat.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color:
                    currentChatId === chat.id
                      ? "#fff"
                      : "rgba(255,255,255,0.65)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {chat.title || "New Chat"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.28)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 2,
                }}
              >
                {chat.messages?.[chat.messages.length - 1]?.content?.slice(
                  0,
                  40,
                ) || "Start a conversation"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.18)",
                  marginTop: 1,
                }}
              >
                {chat.lastUpdated
                  ? new Date(chat.lastUpdated).toLocaleString()
                  : "Just now"}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: 12,
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No chats yet.
            <br />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
              Start a new conversation
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleGetMessages,
  } = useChat();

  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats || {});
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const t = THEMES[theme] || THEMES.teal;

  const [activeNav, setActiveNav]   = useState('chats')
  const [message, setMessage]       = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hydrated, setHydrated]     = useState(false)
  const [chatsLoaded, setChatsLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const prevChatIdRef  = useRef(null)

  // ── Init: socket + chats ──
  useEffect(() => {
    initializeSocketConnection()
    ;(async () => {
      await handleGetChats()
      setChatsLoaded(true)
    })()
  }, [])

  // ── Restore currentChatId from localStorage on reload ──
  useEffect(() => {
    const saved = localStorage.getItem("nexus_currentChatId");
    if (saved) dispatch(setcurrentChatId(saved));
    setHydrated(true);
  }, [dispatch]);

  // ── Persist currentChatId ──
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("nexus_currentChatId", currentChatId);
    } else {
      localStorage.removeItem("nexus_currentChatId");
    }
  }, [currentChatId]);

  // ── Load messages when chat selected and empty ──
  useEffect(() => {
    if (
      currentChatId &&
      chats[currentChatId] &&
      !chats[currentChatId]?.messages?.length
    ) {
      void handleGetMessages(currentChatId);
    }
  }, [currentChatId, chats]);

  const selectedChat = currentChatId ? chats[currentChatId] : null;
  const selectedMessages = selectedChat?.messages || [];

  // ── Scroll to bottom ──
  useEffect(() => {
    const chatChanged = prevChatIdRef.current !== currentChatId;
    messagesEndRef.current?.scrollIntoView({
      behavior: chatChanged ? "auto" : "smooth",
    });
    prevChatIdRef.current = currentChatId;
  }, [selectedMessages, currentChatId]);

  // ── Greeting ──
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName =
    user?.name?.split(" ")[0] ||
    user?.username?.split(" ")[0] ||
    user?.firstName ||
    user?.email?.split("@")[0] ||
    "there";

  const chatList = Object.values(chats).sort((a, b) =>
    (b.lastUpdated || "").localeCompare(a.lastUpdated || ""),
  );

  // ── Handlers ──
  const handleSelectChat = useCallback(
    async (chatId) => {
      dispatch(setcurrentChatId(chatId));
      if (!chats[chatId]?.messages?.length) {
        await handleGetMessages(chatId);
      }
    },
    [chats, dispatch, handleGetMessages],
  );

  const handleNewChat = useCallback(() => {
    dispatch(setcurrentChatId(null));
    setMessage("");
  }, [dispatch]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    const text = message.trim();
    setMessage("");
    await handleSendMessage({ message: text, chatId: currentChatId });
  }, [message, isLoading, currentChatId, handleSendMessage]);

  const sidebarProps = {
    t,
    theme,
    dispatch,
    chatList,
    currentChatId,
    activeNav,
    setActiveNav,
    onSelectChat: handleSelectChat,
    onNewChat: handleNewChat,
  };

  // ── Markdown component map ──
  const mdComponents = {
    p:          ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.6, fontSize: 13 }}>{children}</p>,
    code: ({ inline, className, children }) => {
      const match = /language-(\w+)/.exec(className || '')
      const isInline = inline ?? !match
      const codeString = String(children).replace(/\n$/, '')
      return isInline
        ? <code style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>{children}</code>
        : <CodeBlock language={match?.[1]} code={codeString} />
    },
    pre: ({ children }) => <>{children}</>,
    ul: ({ children }) => (
      <ul style={{ paddingLeft: 20, margin: "4px 0" }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ paddingLeft: 20, margin: "4px 0" }}>{children}</ol>
    ),
    li: ({ children }) => (
      <li style={{ margin: "3px 0", fontSize: 13, lineHeight: 1.5 }}>
        {children}
      </li>
    ),
    h1: ({ children }) => (
      <h1
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: "10px 0 4px",
          color: "#fff",
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          margin: "8px 0 4px",
          color: "#fff",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          margin: "6px 0 4px",
          color: "#fff",
        }}
      >
        {children}
      </h3>
    ),
    strong: ({ children }) => (
      <strong style={{ color: t.primary, fontWeight: 600 }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
        {children}
      </em>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: `3px solid ${t.primary}`,
          paddingLeft: 10,
          margin: "8px 0",
          color: "rgba(255,255,255,0.6)",
          fontStyle: "italic",
        }}
      >
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ color: t.primary, textDecoration: "underline" }}
      >
        {children}
      </a>
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: t.bg,
      }}
    >
      {/* ── Desktop sidebar ── */}
      <div style={{ display: "none" }} className="md:flex" id="desktop-sidebar">
        <Sidebar {...sidebarProps} onClose={null} />
      </div>
      <style>{`@media (min-width: 768px) { #desktop-sidebar { display: flex !important; } } #mobile-overlay, #mobile-drawer { display: none; } @media (max-width: 767px) { #mobile-overlay, #mobile-drawer { display: block; } }`}</style>

      {/* ── Mobile drawer overlay ── */}
      <div
        id="mobile-overlay"
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 40,
          backdropFilter: "blur(2px)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ── Mobile drawer ── */}
      <div
        id="mobile-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Sidebar {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </div>

      {/* ── Main ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            borderBottom: "0.5px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}
        >
          {/* Hamburger — mobile only via inline style */}
          <button
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            id="hamburger-btn"
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconEl
              name={drawerOpen ? "close" : "menu"}
              size={18}
              color="rgba(255,255,255,0.6)"
            />
          </button>
          <style>{`@media (min-width: 768px) { #hamburger-btn { display: none !important; } }`}</style>

          <IconEl name="message" size={16} color={t.primary} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedChat?.title || "New conversation"}
          </span>

          <button
            style={{
              width: 28,
              height: 28,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconEl name="dots" size={15} color="rgba(255,255,255,0.25)" />
          </button>
        </div>

        {/* Welcome screen */}
        {!hydrated || (currentChatId && !chatsLoaded) ? (
          <div style={{ flex: 1 }} />
        ) : !selectedChat ? (
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
            <p
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "#fff",
                margin: "0 0 6px",
                textAlign: "center",
              }}
            >
              {getGreeting()}, {userName} 👋
            </p>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                margin: "0 0 28px",
                textAlign: "center",
              }}
            >
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
                  onClick={() => setMessage(s.label + ": ")}
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
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
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
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: t.primary,
                      margin: "0 0 3px",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px 0",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {selectedMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                {/* AI avatar */}
                {msg.role !== "user" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: `${t.primary}22`,
                      border: `1px solid ${t.primary}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <IconEl name="sparkles" size={13} color={t.primary} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 4px 16px 16px"
                        : "4px 16px 16px 16px",
                    background:
                      msg.role === "user"
                        ? `${t.primary}22`
                        : "rgba(255,255,255,0.05)",
                    border:
                      msg.role === "user"
                        ? `1px solid ${t.primary}33`
                        : "1px solid rgba(255,255,255,0.07)",
                    color: "#fff",
                  }}
                >
                  
                  {msg.role === "user" ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.content}
                    </p>
                  ) : (
                    <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: t.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                      fontSize: 10,
                      fontWeight: 600,
                      color: t.textOn,
                    }}
                  >
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: `${t.primary}22`,
                    border: `1px solid ${t.primary}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconEl name="sparkles" size={13} color={t.primary} />
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "4px 16px 16px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: t.primary,
                        animation: `nexus-bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>
        )}

        {/* Input bar */}
        <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.09)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = `${t.primary}55`)
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")
            }
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#fff",
                fontFamily: "inherit",
              }}
            />
            <button
              aria-label="Attach file"
              style={{
                width: 28,
                height: 28,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconEl name="clip" size={15} color="rgba(255,255,255,0.3)" />
            </button>
            <button
              aria-label="Voice input"
              style={{
                width: 28,
                height: 28,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconEl name="mic" size={15} color="rgba(255,255,255,0.3)" />
            </button>
            <button
              onClick={() => void handleSend()}
              disabled={isLoading || !message.trim()}
              aria-label="Send message"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "none",
                cursor:
                  message.trim() && !isLoading ? "pointer" : "not-allowed",
                backgroundColor:
                  message.trim() && !isLoading
                    ? t.primary
                    : "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <IconEl
                name="arrowUp"
                size={16}
                color={
                  message.trim() && !isLoading
                    ? t.textOn
                    : "rgba(255,255,255,0.3)"
                }
              />
            </button>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.15)",
            }}
          >
            Nexus may make mistakes. Verify important information.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes nexus-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default Dashboard;
