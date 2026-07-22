// audioSettings.ts
// ---------------------------------------------------------------------------
// Central persistence for the Bangla Audio Learning System preferences:
//   * audioEnabled (ON/OFF)
//   * voice        (selected SpeechVoiceInfo id)
//   * speed        (playback rate)
//
// Primary store: localStorage (always available, restored on reopen).
// Optional cloud sync: if a user-settings endpoint exists on the backend, the
// preferences are synchronized after login. The sync is best-effort — any
// failure is swallowed so the local experience is never broken. No backend
// schema changes are required.
// ---------------------------------------------------------------------------

import { API_BASE_URL } from '../config/api'

export interface AudioSettings {
  audioEnabled: boolean
  voice: string
  speed: number
}

const STORAGE_KEY = 'alokbartika_audio_settings'
const DEFAULTS: AudioSettings = {
  audioEnabled: false,
  voice: '',
  speed: 1,
}

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<AudioSettings>
    return {
      audioEnabled: typeof parsed.audioEnabled === 'boolean' ? parsed.audioEnabled : DEFAULTS.audioEnabled,
      voice: typeof parsed.voice === 'string' ? parsed.voice : DEFAULTS.voice,
      speed: typeof parsed.speed === 'number' && parsed.speed > 0 ? parsed.speed : DEFAULTS.speed,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveAudioSettingsLocal(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* noop */
  }
}

/**
 * Best-effort cloud sync. Returns true when the backend accepted the settings.
 * Silently returns false on any error so callers never break.
 */
export async function syncAudioSettingsToServer(
  settings: AudioSettings,
  token: string | null,
): Promise<boolean> {
  if (!token) return false
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ audio: settings }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Best-effort cloud load. Returns merged settings (server wins on conflicts)
 * or the local settings unchanged when the endpoint is unavailable.
 */
export async function loadAudioSettingsFromServer(
  local: AudioSettings,
  token: string | null,
): Promise<AudioSettings> {
  if (!token) return local
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me/settings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return local
    const data = (await res.json()) as { audio?: Partial<AudioSettings> }
    if (!data.audio) return local
    return {
      audioEnabled: typeof data.audio.audioEnabled === 'boolean' ? data.audio.audioEnabled : local.audioEnabled,
      voice: typeof data.audio.voice === 'string' ? data.audio.voice : local.voice,
      speed: typeof data.audio.speed === 'number' && data.audio.speed > 0 ? data.audio.speed : local.speed,
    }
  } catch {
    return local
  }
}
