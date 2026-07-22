import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../hook/useChat";
import { THEMES } from "../../../config/themes";
import { setcurrentChatId } from "../chat.slice";

import IconEl from "../components/IconEl";
import CodeBlock from "../components/CodeBlock";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import WelcomeScreen from "../components/WelcomeScreen";
import ChatInput from "../components/ChatInput";

// ─── Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const { handleSendMessage, handleGetChats, handleGetMessages } = useChat();

  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats || {});
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const aiStatus = useSelector((state) => state.chat.aiStatus);
  const t = THEMES[theme] || THEMES.teal;

  const [activeNav, setActiveNav] = useState("chats");
  const [message, setMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop-only collapse
  const [hydrated, setHydrated] = useState(false);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const prevChatIdRef = useRef(null);

  // ── Init: chats (socket ab useChat hook khud initialize karta hai) ──
  useEffect(() => {
    (async () => {
      await handleGetChats();
      setChatsLoaded(true);
    })();
  }, []);

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
    if (currentChatId && chats[currentChatId] && !chats[currentChatId]?.messages?.length) {
      void handleGetMessages(currentChatId);
    }
  }, [currentChatId, chats]);

  const selectedChat = currentChatId ? chats[currentChatId] : null;
  const selectedMessages = selectedChat?.messages || [];

  // ── Scroll to bottom (streaming ke dauraan instant scroll, warna smooth) ──
  useEffect(() => {
    const chatChanged = prevChatIdRef.current !== currentChatId;
    const lastMsg = selectedMessages[selectedMessages.length - 1];
    const isStreaming = lastMsg?.streaming === true;

    messagesEndRef.current?.scrollIntoView({
      behavior: chatChanged || isStreaming ? "auto" : "smooth",
    });
    prevChatIdRef.current = currentChatId;
  }, [selectedMessages, currentChatId]);

  // ── Greeting ──
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName =
    user?.name?.split(" ")[0] ||
    user?.username?.split(" ")[0] ||
    user?.firstName ||
    user?.email?.split("@")[0] ||
    "there";

  // ── chatList ab sirf tab recalculate hoga jab 'chats' change ho ──
  const chatList = useMemo(
    () => Object.values(chats).sort((a, b) => (b.lastUpdated || "").localeCompare(a.lastUpdated || "")),
    [chats],
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

  // ── Markdown component map — ab sirf theme (t) change hone pe naya banega ──
  const mdComponents = useMemo(
    () => ({
      p: ({ children }) => <p style={{ margin: "0 0 8px", lineHeight: 1.6, fontSize: 13 }}>{children}</p>,
      code: ({ inline, className, children }) => {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = inline ?? !match;
        const codeString = String(children).replace(/\n$/, "");
        return isInline ? (
          <code style={{ backgroundColor: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 }}>
            {children}
          </code>
        ) : (
          <CodeBlock language={match?.[1]} code={codeString} />
        );
      },
      pre: ({ children }) => <>{children}</>,
      ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "4px 0" }}>{children}</ul>,
      ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "4px 0" }}>{children}</ol>,
      li: ({ children }) => <li style={{ margin: "3px 0", fontSize: 13, lineHeight: 1.5 }}>{children}</li>,
      h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 600, margin: "10px 0 4px", color: "#fff" }}>{children}</h1>,
      h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 600, margin: "8px 0 4px", color: "#fff" }}>{children}</h2>,
      h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, margin: "6px 0 4px", color: "#fff" }}>{children}</h3>,
      strong: ({ children }) => <strong style={{ color: t.primary, fontWeight: 600 }}>{children}</strong>,
      em: ({ children }) => <em style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{children}</em>,
      blockquote: ({ children }) => (
        <blockquote style={{ borderLeft: `3px solid ${t.primary}`, paddingLeft: 10, margin: "8px 0", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
          {children}
        </blockquote>
      ),
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noreferrer" style={{ color: t.primary, textDecoration: "underline" }}>
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div style={{ overflowX: "auto", margin: "10px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead style={{ background: `${t.primary}18` }}>{children}</thead>,
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{children}</tr>,
      th: ({ children }) => (
        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: t.primary, borderBottom: `1px solid ${t.primary}44`, whiteSpace: "nowrap" }}>
          {children}
        </th>
      ),
      td: ({ children }) => <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.8)" }}>{children}</td>,
    }),
    [t],
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: t.bg }}>
      {/* ── Desktop sidebar — 'collapsed' se width animate hoti hai ── */}
      <div style={{ display: "none" }} className="md:flex" id="desktop-sidebar">
        <Sidebar
          {...sidebarProps}
          onClose={null}
          collapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        />
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
          {/* <button
            onClick={() => {
              // Desktop pe inline-collapse toggle karo, mobile pe overlay-drawer toggle karo
              if (window.matchMedia("(min-width: 768px)").matches) {
                setSidebarOpen((prev) => !prev);
              } else {
                setDrawerOpen((prev) => !prev);
              }
            }}
            aria-label="Toggle sidebar"
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
            <IconEl name="menu" size={18} color="rgba(255,255,255,0.6)" />
          </button> */}
          {/* Ab hamburger desktop pe bhi visible hai — media-query hide hata diya */}

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

        {/* Welcome screen or Chat messages */}
        {!hydrated || (currentChatId && !chatsLoaded) ? (
          <div style={{ flex: 1 }} />
        ) : !selectedChat ? (
          <WelcomeScreen
            t={t}
            greeting={greeting}
            userName={userName}
            onSuggestionClick={(label) => setMessage(label + ": ")}
          />
        ) : (
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
              <MessageBubble key={i} msg={msg} t={t} userName={userName} mdComponents={mdComponents} />
            ))}

            {aiStatus === "thinking" && <TypingIndicator t={t} />}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>
        )}

        <ChatInput message={message} setMessage={setMessage} onSend={handleSend} isLoading={isLoading} t={t} />
      </div>

      <style>{`
        @keyframes nexus-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes nexus-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
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