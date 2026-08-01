/**
 * TypingIndicator — animated bubble that appears when the admin is typing.
 */

import React from 'react'

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 px-4 py-1">
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #0E7C66, #04342C)' }}
    >
      আ
    </div>
    <div
      className="px-4 py-3 rounded-2xl rounded-bl-sm"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent)',
              animation: `chatBounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
)

export default TypingIndicator
