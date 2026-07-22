import { Volume2, Play, Pause, Square } from 'lucide-react'
import { motion } from 'framer-motion'

interface TTSControlsProps {
  isPlaying: boolean
  isPaused: boolean
  supported: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function TTSControls({
  isPlaying,
  isPaused,
  supported,
  onStart,
  onPause,
  onResume,
  onStop,
}: TTSControlsProps) {
  if (!supported) return null

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl border"
      style={{
        backgroundColor: 'rgba(29, 158, 117, 0.04)',
        borderColor: 'rgba(29, 158, 117, 0.15)',
      }}
    >
      {!isPlaying ? (
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: 'rgba(29, 158, 117, 0.08)',
            color: 'var(--color-accent, #1D9E75)',
          }}
          title="পাঠটি শুনুন"
        >
          <Volume2 size={14} />
          <span>শুনুন</span>
        </motion.button>
      ) : (
        <div className="flex items-center">
          {isPaused ? (
            <motion.button
              onClick={onResume}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-accent, #1D9E75)' }}
              title="আবার চালু করুন"
            >
              <Play size={14} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              onClick={onPause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--color-accent, #1D9E75)' }}
              title="থামুন"
            >
              <Pause size={14} fill="currentColor" />
            </motion.button>
          )}
          <motion.button
            onClick={onStop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg transition-all text-red-500 hover:bg-red-500/10"
            title="বন্ধ করুন"
          >
            <Square size={12} fill="currentColor" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
