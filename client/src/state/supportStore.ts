import { create } from 'zustand'

type SupportState = {
  studentUnread: number
  setStudentUnread: (count: number) => void
  incrementStudentUnread: () => void
  clearStudentUnread: () => void
}

export const useSupportStore = create<SupportState>((set) => ({
  studentUnread: 0,
  setStudentUnread: (count) => set({ studentUnread: Math.max(0, count) }),
  incrementStudentUnread: () => set((s) => ({ studentUnread: s.studentUnread + 1 })),
  clearStudentUnread: () => set({ studentUnread: 0 }),
}))
