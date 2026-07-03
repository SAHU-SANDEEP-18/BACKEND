import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hook/useChat'
import { THEMES } from '../../../config/themes'

const Dashboard = () => {
  const chat = useChat()
  const theme = useSelector((state) => state.theme.theme)
  const t = THEMES[theme] || THEMES.teal

  useEffect(() => {
    chat.initializeSocketConnection()
  }, [])

  return (
    <main className="min-h-screen px-4 py-6" style={{ backgroundColor: t.bg, color: t.textOn }}>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border p-8 shadow-2xl shadow-black/20" style={{ backgroundColor: t.sidebar, borderColor: `${t.primary}55` }}>
          <h1 className="text-3xl font-semibold" style={{ color: t.primary }}>
            Dashboard
          </h1>
          <p className="mt-3 text-sm text-white/75">
            Use the theme switcher icon at the top right to change the app theme.
          </p>
        </div>
      </div>
    </main>
  )
}

export default Dashboard