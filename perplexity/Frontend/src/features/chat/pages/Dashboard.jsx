import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hook/useChat'
import { THEMES } from '../../../config/themes'

// SVG Icons
const Icons = {
  sparkles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/></svg>,
  message:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  compass:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  folder:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  plug:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M7 17l-4 4M17 7l4-4M8 3v4M16 3v4M3 8h4M13 8h4M8 13h4M8 16h8"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  edit:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  search:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  dots:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  share:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>,
  clip:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
  mic:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  arrowUp:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  pencil:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  code:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  bulb:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
  chart:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  lang:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  book:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
}

const NAV_ITEMS = [
  { icon: 'message',  label: 'Chats',   key: 'chats' },
  { icon: 'compass',  label: 'Explore', key: 'explore' },
  { icon: 'folder',   label: 'Files',   key: 'files' },
  { icon: 'plug',     label: 'Plugins', key: 'plugins' },
]

const SUGGESTIONS = [
  { icon: 'pencil', label: 'Write',       desc: 'Draft emails, docs, proposals' },
  { icon: 'code',   label: 'Code',        desc: 'Debug, review, or generate' },
  { icon: 'bulb',   label: 'Brainstorm',  desc: 'Ideas, plans, strategies' },
  { icon: 'chart',  label: 'Analyze',     desc: 'Data, reports, summaries' },
  { icon: 'lang',   label: 'Translate',   desc: 'Any language, any tone' },
  { icon: 'book',   label: 'Learn',       desc: 'Explain any topic simply' },
]

const MOCK_CHATS = {
  pinned: [
    { id: 1, title: 'Project planning', preview: "Let's map out priorities first", time: '2 min ago' },
  ],
  today: [
    { id: 2, title: 'API integration help', preview: 'Axios vs fetch debate', time: '1 hr ago' },
    { id: 3, title: 'Redux slice cleanup', preview: 'chatSlice replyTo reducer', time: '3 hr ago' },
  ],
  yesterday: [
    { id: 4, title: 'Login UI review', preview: 'Portal button diagonal fix', time: 'Yesterday' },
    { id: 5, title: 'Toast component', preview: 'Custom toastify theme', time: 'Yesterday' },
  ],
}

const Dashboard = () => {
  const { initializeSocketConnection } = useChat()
  const theme = useSelector((state) => state.theme.theme)
  const user = useSelector((state) => state.auth.user)
  const t = THEMES[theme] || THEMES.teal

  const [activeNav, setActiveNav] = useState('chats')
  const [activeChat, setActiveChat] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    initializeSocketConnection()
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // username fix — try multiple fields
  const userName =
    user?.name?.split(' ')[0] ||
    user?.username?.split(' ')[0] ||
    user?.firstName ||
    user?.email?.split('@')[0] ||
    'there'

  const initials = userName.slice(0, 2).toUpperCase()

  const IconEl = ({ name, size = 18, color = 'currentColor' }) => (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color, width: size, height: size, flexShrink: 0 }}>
      {Icons[name]}
    </span>
  )

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', backgroundColor: t.bg }}>

      {/* ── Icon Rail ── */}
      <div
        className="flex flex-col items-center py-4 gap-1 flex-shrink-0"
        style={{ width: 56, backgroundColor: t.sidebar, borderRight: `0.5px solid rgba(255,255,255,0.06)` }}
      >
        <div
          className="flex items-center justify-center rounded-xl mb-4 flex-shrink-0"
          style={{ width: 32, height: 32, backgroundColor: t.primary, color: t.textOn }}
        >
          <IconEl name="sparkles" size={16} color={t.textOn} />
        </div>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            aria-label={item.label}
            style={{
              position: 'relative', width: 40, height: 40, borderRadius: 10,
              background: activeNav === item.key ? `${t.primary}22` : 'transparent',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {activeNav === item.key && (
              <span style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 20, backgroundColor: t.primary, borderRadius: '0 3px 3px 0',
              }} />
            )}
            <IconEl name={item.icon} size={18} color={activeNav === item.key ? t.primary : 'rgba(255,255,255,0.3)'} />
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          aria-label="Settings"
          style={{ width: 40, height: 40, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <IconEl name="settings" size={18} color="rgba(255,255,255,0.3)" />
        </button>

        <div
          className="flex items-center justify-center rounded-full text-xs font-medium cursor-pointer mt-1 flex-shrink-0"
          style={{ width: 30, height: 30, backgroundColor: t.primary, color: t.textOn, fontSize: 11 }}
        >
          {initials}
        </div>
      </div>

      {/* ── Chat List ── */}
      <div
        className="flex flex-col flex-shrink-0"
        style={{ width: 220, backgroundColor: t.sidebar, borderRight: `0.5px solid rgba(255,255,255,0.06)` }}
      >
        <div className="flex items-center justify-between px-3 pt-4 pb-3">
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Chats</span>
          <button
            aria-label="New chat"
            style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: `${t.primary}22`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconEl name="edit" size={14} color={t.primary} />
          </button>
        </div>

        <div
          className="flex items-center gap-2 mx-3 mb-2 px-2 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
        >
          <IconEl name="search" size={13} color="rgba(255,255,255,0.25)" />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Search...</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.entries(MOCK_CHATS).map(([section, chats]) => (
            <div key={section}>
              <div style={{ padding: '8px 12px 3px', fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                {section}
              </div>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    borderLeft: `2px solid ${activeChat === chat.id ? t.primary : 'transparent'}`,
                    background: activeChat === chat.id ? `${t.primary}12` : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 12, color: activeChat === chat.id ? '#fff' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {chat.preview}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>
                    {chat.time}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* <div style={{ padding: '10px 12px', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: t.primary, color: t.textOn, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
            {initials}
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || user?.username || user?.email || 'User'}
          </span>
          <button style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconEl name="dots" size={14} color="rgba(255,255,255,0.4)" />
          </button>
        </div> */}
      </div>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderBottom: '0.5px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <IconEl name="message" size={16} color={t.primary} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>New conversation</span>
          <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconEl name="share" size={15} color="rgba(255,255,255,0.25)" />
          </button>
          <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconEl name="dots" size={15} color="rgba(255,255,255,0.25)" />
          </button>
        </div>

        {/* Welcome */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: t.textOn }}>
            <IconEl name="sparkles" size={28} color={t.textOn} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 500, color: '#fff', margin: '0 0 6px', textAlign: 'center' }}>
            {getGreeting()}, {userName} 👋
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 28px', textAlign: 'center' }}>
            What would you like to work on today?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 500 }}>
            {SUGGESTIONS.map((s) => (
              <div
                key={s.label}
                style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${t.primary}12`; e.currentTarget.style.borderColor = `${t.primary}44` }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${t.primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <IconEl name={s.icon} size={15} color={t.primary} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: t.primary, margin: '0 0 3px' }}>{s.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '14px 20px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.09)' }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#fff', fontFamily: 'inherit' }}
            />
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconEl name="clip" size={15} color="rgba(255,255,255,0.3)" />
            </button>
            <button style={{ width: 28, height: 28, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconEl name="mic" size={15} color="rgba(255,255,255,0.3)" />
            </button>
            <button
              style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: t.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <IconEl name="arrowUp" size={16} color={t.textOn} />
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
            Nexus may make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard