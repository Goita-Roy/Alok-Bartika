import { useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'

interface ThumbnailPreviewProps {
  url: string
  alt: string
  size?: 'sm' | 'md'
  showError?: boolean
}

const isValidUrl = (value: string): boolean => {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function ThumbnailPreview({ url, alt, size = 'md', showError = true }: ThumbnailPreviewProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-16 h-16'
  const iconSize = size === 'sm' ? 14 : 20

  if (!url || url.trim() === '') {
    return (
      <div
        className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0`}
        style={{
          backgroundColor: 'var(--color-accent-pale)',
          border: '1px dashed var(--color-border)',
        }}
      >
        <ImageIcon size={iconSize} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
      </div>
    )
  }

  if (!isValidUrl(url)) {
    if (!showError) {
      return (
        <div
          className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0`}
          style={{
            backgroundColor: 'var(--color-accent-pale)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <ImageIcon size={iconSize} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
        </div>
      )
    }
    return (
      <div
        className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0`}
        style={{
          backgroundColor: 'rgba(226,75,74,0.08)',
          border: '1px dashed var(--color-error)',
        }}
      >
        <X size={iconSize} style={{ color: 'var(--color-error)' }} />
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0`}
        style={{
          backgroundColor: 'rgba(226,75,74,0.08)',
          border: '1px dashed var(--color-error)',
        }}
      >
        <X size={iconSize} style={{ color: 'var(--color-error)' }} />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`${sizeClass} rounded-xl object-cover shrink-0`}
      onError={() => setHasError(true)}
    />
  )
}
