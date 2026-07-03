import React from 'react'
import { Outlet } from 'react-router'
import { useSelector } from 'react-redux'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { THEMES } from '../config/themes'

const AppLayout = () => {
  const theme = useSelector((state) => state.theme.theme)
  const t = THEMES[theme] || THEMES.teal

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.textOn, position: 'relative' }}>
      <ThemeSwitcher />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AppLayout
