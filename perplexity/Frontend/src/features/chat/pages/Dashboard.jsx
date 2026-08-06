import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../hook/useChat";
import { THEMES } from "../../../config/themes";
import { setcurrentChatId, setQuotedText, clearQuotedText, setError } from "../chat.slice";
import { uploadFiles } from "../service/chat.api";

import IconEl from "../components/IconEl";
import CodeBlock from "../components/CodeBlock";
import Sidebar from "../components/Sidebar";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import WelcomeScreen from "../components/WelcomeScreen";
import ChatInput from "../components/ChatInput";
import ShortcutsModal from "../components/ShortcutsModal";
import { exportAsMarkdown, exportAsPDF } from "../utils/exportChat";
import ShareModal from "../components/ShareModal";
import MessageSearchBar from "../components/MessageSearchBar";
import SettingsModal from "../components/SettingsModal";
import { updateChatShareStatus, setFolders, addFolder, renameFolderInState, removeFolder, setChatFolder } from "../chat.slice";
import { createFolder, getFolders, renameFolder, deleteFolder, moveChatToFolder } from "../../folder/folder.api";

// ─── Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    handleSendMessage,
    handleGetChats,
    handleGetMessages,
    handleStopGeneration,
    handleRegenerate,
    handleEditMessage,
    handleRenameChat,
    handleDeleteChat,
    handleReaction,
  } = useChat();

  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats || {});
  const folders = useSelector((state) => state.chat.folders || []);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const aiStatus = useSelector((state) => state.chat.aiStatus);
  const quotedText = useSelector((state) => state.chat.quotedText);
  const t = THEMES[theme] || THEMES.teal;

  const [activeNav, setActiveNav] = useState("chats");
  const [message, setMessage] = useState("");
  const [pastedContent, setPastedContent] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]); // [{ file, previewUrl }]
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const messageRefs = useRef({});
  const [isUploading, setIsUploading] = useState(false); // file upload ke dauraan send block karne ke liye
  const [drawerOpen, setDrawerOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);

  handleResize();

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
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

  // ── Init: folders ──
  useEffect(() => {
    (async () => {
      try {
        const data = await getFolders();
        dispatch(setFolders(data.folders));
      } catch (err) {
        console.error("Failed to load folders:", err);
      }
    })();
  }, []);

    const handleNewChat = useCallback(() => {
    dispatch(setcurrentChatId(null));
    setMessage("");
  }, [dispatch]);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey; // Windows: Ctrl, Mac: Cmd

      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleNewChat();
      } else if (isMod && e.key === "/") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (isMod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) {
          setSidebarOpen((prev) => !prev);
        } else {
          setDrawerOpen((prev) => !prev);
        }
      } else if (isMod && e.key.toLowerCase() === "f" && currentChatId) {
        e.preventDefault();
        setSearchBarOpen(true);
      } else if (e.key === "Escape") {
        setShortcutsOpen(false);
        setSearchBarOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat]);

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

  // ── Search-matches: indices of messages jinme query milta hai ──
  const matchIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return selectedMessages
      .map((msg, i) => (msg.content?.toLowerCase().includes(q) ? i : -1))
      .filter((i) => i !== -1);
  }, [selectedMessages, searchQuery]);

  // Jab matches badlein (naya search ya messages update), activeIndex reset karo
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery, currentChatId]);

  // Active-match pe scroll karo
  useEffect(() => {
    if (matchIndices.length === 0) return;
    const targetIndex = matchIndices[activeMatchIndex];
    messageRefs.current[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeMatchIndex, matchIndices]);

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

  const handleSend = useCallback(async () => {
    const hasPasted = !!pastedContent;
    const hasFiles = attachedFiles.length > 0;
    // isUploading check zaroori hai — dobara click/Enter se overlapping upload+send na ho
    if ((!message.trim() && !hasPasted && !hasFiles) || isLoading || isUploading) return;

    const pastedText = pastedContent?.text || "";
    const finalText = hasPasted
      ? message.trim()
        ? `${pastedText}\n\n${message.trim()}`
        : pastedText
      : message.trim();

    const filesToUpload = attachedFiles.map((item) => item.file);

    setMessage("");
    setPastedContent(null);
    setAttachedFiles([]);

    let attachments = [];
    if (filesToUpload.length > 0) {
      setIsUploading(true);
      try {
        attachments = await uploadFiles(filesToUpload);
      } catch (err) {
        dispatch(setError("File upload failed. Please try again."));
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    await handleSendMessage({
      message: finalText,
      chatId: currentChatId,
      quotedText,
      attachments,
    });
  }, [message, pastedContent, attachedFiles, isLoading, isUploading, currentChatId, quotedText, handleSendMessage, dispatch]);

  const sidebarProps = {
    t,
    theme,
    dispatch,
    chatList,
    folders,
    currentChatId,
    activeNav,
    setActiveNav,
    onSelectChat: handleSelectChat,
    onNewChat: handleNewChat,
    onRenameChat: handleRenameChat,
    onDeleteChat: handleDeleteChat,
    onOpenShortcuts: () => setShortcutsOpen(true),
    onOpenSettings: () => setSettingsOpen(true),
    onCreateFolder: async (name) => {
      try {
        const data = await createFolder(name);
        dispatch(addFolder(data.folder));
      } catch (err) {
        console.error("Failed to create folder:", err);
      }
    },
    onRenameFolder: async (folderId, name) => {
      try {
        await renameFolder(folderId, name);
        dispatch(renameFolderInState({ folderId, name }));
      } catch (err) {
        console.error("Failed to rename folder:", err);
      }
    },
    onDeleteFolder: async (folderId) => {
      try {
        await deleteFolder(folderId);
        dispatch(removeFolder(folderId));
      } catch (err) {
        console.error("Failed to delete folder:", err);
      }
    },
    onMoveChatToFolder: async (chatId, folderId) => {
      try {
        await moveChatToFolder(chatId, folderId);
        dispatch(setChatFolder({ chatId, folderId }));
      } catch (err) {
        console.error("Failed to move chat:", err);
      }
    },
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
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Toggle sidebar"
            id="hamburger-btn"
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: isMobile ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconEl name="menu" size={18} color="rgba(255,255,255,0.6)" />
          </button>
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
            onClick={() => setSearchBarOpen((prev) => !prev)}
            aria-label="Search in chat"
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
            <IconEl name="search" size={14} color="rgba(255,255,255,0.35)" />
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setExportMenuOpen((prev) => !prev)}
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

            {exportMenuOpen && (
              <>
                <div
                  onClick={() => setExportMenuOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "#161616",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: 6,
                    minWidth: 170,
                    zIndex: 41,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  }}
                >
                  <button
                    disabled={!selectedChat}
                    onClick={() => {
                      exportAsMarkdown(selectedChat?.title, selectedMessages);
                      setExportMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      cursor: selectedChat ? "pointer" : "not-allowed",
                      opacity: selectedChat ? 1 : 0.4,
                      fontSize: 12.5,
                      color: "rgba(255,255,255,0.85)",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => selectedChat && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <IconEl name="download" size={13} color="rgba(255,255,255,0.6)" />
                    Export as Markdown
                  </button>
                  <button
                    disabled={!selectedChat}
                    onClick={() => {
                      setShareModalOpen(true);
                      setExportMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      cursor: selectedChat ? "pointer" : "not-allowed",
                      opacity: selectedChat ? 1 : 0.4,
                      fontSize: 12.5,
                      color: "rgba(255,255,255,0.85)",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => selectedChat && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <IconEl name="share" size={13} color="rgba(255,255,255,0.6)" />
                    Share chat
                  </button><button
                    disabled={!selectedChat}
                    onClick={() => {
                      exportAsPDF(selectedChat?.title, selectedMessages);
                      setExportMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      cursor: selectedChat ? "pointer" : "not-allowed",
                      opacity: selectedChat ? 1 : 0.4,
                      fontSize: 12.5,
                      color: "rgba(255,255,255,0.85)",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => selectedChat && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <IconEl name="download" size={13} color="rgba(255,255,255,0.6)" />
                    Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>
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
          <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {searchBarOpen && (
              <MessageSearchBar
                query={searchQuery}
                setQuery={setSearchQuery}
                matchCount={matchIndices.length}
                activeIndex={activeMatchIndex}
                onNext={() => setActiveMatchIndex((prev) => (prev + 1) % Math.max(matchIndices.length, 1))}
                onPrev={() => setActiveMatchIndex((prev) => (prev - 1 + matchIndices.length) % Math.max(matchIndices.length, 1))}
                onClose={() => {
                  setSearchBarOpen(false);
                  setSearchQuery("");
                }}
                t={t}
              />
            )}
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
              <MessageBubble
                key={i}
                msg={msg}
                t={t}
                userName={userName}
                mdComponents={mdComponents}
                isLast={i === selectedMessages.length - 1}
                onRegenerate={() => handleRegenerate(currentChatId)}
                onEdit={(newContent) =>
                  handleEditMessage({
                    chatId: currentChatId,
                    messageId: msg._id,
                    messageIndex: i,
                    newContent,
                  })
                }
                onReply={(text) => dispatch(setQuotedText(text))}
                onReact={(reaction) =>
                  handleReaction({ chatId: currentChatId, messageId: msg._id, messageIndex: i, reaction })
                }
                searchQuery={searchBarOpen ? searchQuery : ""}
                isActiveMatch={matchIndices[activeMatchIndex] === i}
                messageRef={(el) => (messageRefs.current[i] = el)}
              />
            ))}

            {aiStatus === "thinking" && <TypingIndicator t={t} />}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>
          </div>
        )}

        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSend}
          onStop={handleStopGeneration}
          isLoading={isLoading}
          isUploading={isUploading}
          t={t}
          quotedText={quotedText}
          onClearQuote={() => dispatch(clearQuotedText())}
          pastedContent={pastedContent}
          setPastedContent={setPastedContent}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
      </div>

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} t={t} />}
      {settingsOpen && <SettingsModal user={user} onClose={() => setSettingsOpen(false)} t={t} />}
      {shareModalOpen && selectedChat && (
        <ShareModal
          chat={selectedChat}
          onClose={() => setShareModalOpen(false)}
          onUpdateShareStatus={(status) => dispatch(updateChatShareStatus({ chatId: currentChatId, ...status }))}
          t={t}
        />
      )}

      <style>{`
        .nexus-tooltip-wrapper:hover .nexus-tooltip-text { opacity: 1 !important; }
        .message-row:hover .edit-btn { opacity: 1 !important; }
        .chat-item:hover .chat-item-actions { opacity: 1 !important; }
.folder-header:hover .folder-actions { opacity: 1 !important; }
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