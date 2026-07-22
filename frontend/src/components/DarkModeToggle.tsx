import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'alokbartika_theme'

export function DarkModeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    // Default to dark if user system prefers it or light as standard
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-xl transition-all duration-300 flex items-center justify-center border"
      style={{
        backgroundColor: 'rgba(29, 158, 117, 0.08)',
        borderColor: 'rgba(29, 158, 117, 0.15)',
        color: 'var(--color-accent, #1D9E75)',
      }}
      title={theme === 'light' ? 'ডার্ক মোড চালু করুন' : 'লাইট মোড চালু করুন'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 360 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </motion.button>
  )
}
