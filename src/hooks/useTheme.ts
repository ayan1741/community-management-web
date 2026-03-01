import { useState, useEffect } from 'react'

const THEME_KEY = 'komsunet-theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, toggleTheme: () => setIsDark(v => !v) }
}
