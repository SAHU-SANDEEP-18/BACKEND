import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '../features/theme/theme.slice'
import { THEMES } from '../config/themes'
import { useToast } from './CustomToast'

const themeKeys = Object.keys(THEMES)

export default function ThemeSwitcher() {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.theme.theme)
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const current = THEMES[currentTheme] || THEMES.teal

  const onSelectTheme = (themeKey) => {
    if (themeKey === currentTheme) {
      setOpen(false)
      return
    }

    dispatch(setTheme(themeKey))
    setOpen(false)
    toast.info(`${THEMES[themeKey].name} theme applied.`)
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border transition hover:shadow-lg"
        style={{
          borderColor: current.primary,
          backgroundColor: current.sidebar,
          color: "#fff",
        }}
        aria-label="Open theme switcher"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-64 rounded-3xl border bg-slate-950/95 p-4 shadow-2xl shadow-black/40" style={{ borderColor: `${current.primary}55`, backgroundColor: current.sidebar }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Theme</p>
              <p className="font-semibold" style={{ color: current.textOn }}>
                {current.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: current.primary, color: current.textOn }}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {themeKeys.map((key) => {
              const theme = THEMES[key]
              const isActive = key === currentTheme

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectTheme(key)}
                  className="rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition"
                  style={{
                    borderColor: isActive ? theme.textOn : 'rgba(255,255,255,0.14)',
                    backgroundColor: isActive ? theme.primary : theme.bg,
                    color: isActive ? theme.textOn : '#f8fafc',
                  }}
                >
                  {theme.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
