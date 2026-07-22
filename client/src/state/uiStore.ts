import { create } from 'zustand'

type UiState = {
  lowBandwidth: boolean
  hydrateUi: () => void
  toggleLowBandwidth: () => void
}

const LS_KEY = 'alokbartika.ui'

export const useUiStore = create<UiState>((set, get) => ({
  lowBandwidth: false,
  hydrateUi: () => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { lowBandwidth?: boolean }
      set({ lowBandwidth: Boolean(parsed.lowBandwidth) })
    } catch {
      // ignore corrupted local value
    }
  },
  toggleLowBandwidth: () => {
    const next = !get().lowBandwidth
    localStorage.setItem(LS_KEY, JSON.stringify({ lowBandwidth: next }))
    set({ lowBandwidth: next })
  },
}))
