import IconEl from "./IconEl";
import { setTheme } from "../../theme/theme.slice";
import { THEME_OPTIONS, NAV_ITEMS } from "../constants";

import { useState, useMemo } from "react";

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
  collapsed = false, // desktop-only collapse state
  onToggleCollapse, // sirf desktop instance pe milega
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Title ya last-message content mein match dhoondo, case-insensitive
  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    const q = searchQuery.trim().toLowerCase();
    return chatList.filter((chat) => {
      const titleMatch = chat.title?.toLowerCase().includes(q);
      const lastMsg = chat.messages?.[chat.messages.length - 1]?.content || "";
      const contentMatch = lastMsg.toLowerCase().includes(q);
      return titleMatch || contentMatch;
    });
  }, [chatList, searchQuery]);

  return (
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
      {collapsed && onToggleCollapse ? (
        <button
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: t.primary,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textOn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      ) : (
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
      )}

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

    {/* Chat list panel — collapsed hone par width 0 ho jaati hai (desktop toggle) */}
    <div
      style={{
        width: collapsed ? 0 : 220,
        opacity: collapsed ? 0 : 1,
        overflow: "hidden",
        backgroundColor: t.sidebar,
        borderRight: collapsed ? "none" : "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, opacity 0.2s ease",
        flexShrink: 0,
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
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          )}
          {/* {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
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
              <IconEl name="menu" size={14} color="rgba(255,255,255,0.5)" />
            </button>
          )} */}
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
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "inherit",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              padding: 0,
            }}
          >
            <IconEl name="close" size={12} color="rgba(255,255,255,0.3)" />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredChatList.length ? (
          filteredChatList.map((chat) => (
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
            {searchQuery ? (
              <>No chats match "{searchQuery}"</>
            ) : (
              <>
                No chats yet.
                <br />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                  Start a new conversation
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default Sidebar;
