import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SupportedLanguage } from '../data/ideLessonData'
import { MONACO_LANGUAGE_MAP } from '../data/ideLessonData'

export type IDEFile = {
  id: string
  name: string
  language: SupportedLanguage
  content: string
}

export type IDETheme = 'dark' | 'light'

const WORKSPACE_STORAGE_PREFIX = 'alokbartika_ide_workspace_'

function fileId() {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function defaultSandboxFiles(): IDEFile[] {
  return [
    {
      id: fileId(),
      name: 'main.py',
      language: 'python',
      content: '# Free Practice Mode\nprint("Hello, Alokbartika!")\n',
    },
  ]
}

function starterToFiles(starter: { name: string; language: SupportedLanguage; content: string }[]): IDEFile[] {
  return starter.map((s) => ({
    id: fileId(),
    name: s.name,
    language: s.language,
    content: s.content,
  }))
}

export function useIDEWorkspace(
  storageKey = 'sandbox',
  initialFiles?: { name: string; language: SupportedLanguage; content: string }[],
) {
  const storageId = `${WORKSPACE_STORAGE_PREFIX}${storageKey}`

  const [files, setFiles] = useState<IDEFile[]>(() =>
    initialFiles?.length ? starterToFiles(initialFiles) : defaultSandboxFiles(),
  )
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id ?? '')
  const [openTabIds, setOpenTabIds] = useState<string[]>(files.map((f) => f.id))
  const [theme, setTheme] = useState<IDETheme>('dark')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem(storageId)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          files?: IDEFile[]
          activeFileId?: string
          openTabIds?: string[]
          theme?: IDETheme
        }
        if (parsed.files?.length) {
          setFiles(parsed.files)
          setActiveFileId(parsed.activeFileId ?? parsed.files[0].id)
          setOpenTabIds(parsed.openTabIds ?? parsed.files.map((f) => f.id))
        } else if (initialFiles?.length) {
          const next = starterToFiles(initialFiles)
          setFiles(next)
          setActiveFileId(next[0].id)
          setOpenTabIds(next.map((f) => f.id))
        }
        if (parsed.theme) setTheme(parsed.theme)
      } catch {
        /* ignore corrupt state */
      }
    } else if (initialFiles?.length) {
      const next = starterToFiles(initialFiles)
      setFiles(next)
      setActiveFileId(next[0].id)
      setOpenTabIds(next.map((f) => f.id))
    }
    setHydrated(true)
    // initialFiles intentionally read from closure when storageKey changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageId])

  useEffect(() => {
    if (!hydrated) return
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        storageId,
        JSON.stringify({ files, activeFileId, openTabIds, theme }),
      )
    }, 400)
    return () => window.clearTimeout(timer)
  }, [files, activeFileId, openTabIds, theme, storageId, hydrated])

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) ?? files[0],
    [files, activeFileId],
  )

  const loadStarterFiles = useCallback(
    (starter: { name: string; language: SupportedLanguage; content: string }[]) => {
      const next = starter.map((s) => ({
        id: fileId(),
        name: s.name,
        language: s.language,
        content: s.content,
      }))
      setFiles(next)
      setActiveFileId(next[0].id)
      setOpenTabIds(next.map((f) => f.id))
    },
    [],
  )

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)))
  }, [])

  const createFile = useCallback((language: SupportedLanguage = 'python') => {
    const extMap: Record<SupportedLanguage, string> = {
      html: 'html',
      css: 'css',
      javascript: 'js',
      python: 'py',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
    }
    const name = `untitled.${extMap[language]}`
    const file: IDEFile = {
      id: fileId(),
      name,
      language,
      content: '',
    }
    setFiles((prev) => [...prev, file])
    setActiveFileId(file.id)
    setOpenTabIds((prev) => [...prev, file.id])
  }, [])

  const renameFile = useCallback((id: string, name: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [])

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((f) => f.id !== id)
      setOpenTabIds((tabs) => tabs.filter((t) => t !== id))
      if (activeFileId === id) setActiveFileId(next[0].id)
      return next
    })
  }, [activeFileId])

  const openTab = useCallback((id: string) => {
    setActiveFileId(id)
    setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const closeTab = useCallback((id: string) => {
    setOpenTabIds((prev) => {
      const next = prev.filter((t) => t !== id)
      if (activeFileId === id && next.length) setActiveFileId(next[next.length - 1])
      return next.length ? next : prev
    })
  }, [activeFileId])

  const downloadProject = useCallback(() => {
    const bundle = files.map((f) => `// --- ${f.name} ---\n${f.content}`).join('\n\n')
    const blob = new Blob([bundle], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storageKey}-project.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [files, storageKey])

  const copyActiveCode = useCallback(async () => {
    if (!activeFile) return false
    try {
      await navigator.clipboard.writeText(activeFile.content)
      return true
    } catch {
      return false
    }
  }, [activeFile])

  const monacoLanguage = activeFile ? MONACO_LANGUAGE_MAP[activeFile.language] : 'python'

  return {
    files,
    activeFile,
    activeFileId,
    openTabIds,
    theme,
    isFullscreen,
    hydrated,
    monacoLanguage,
    setTheme,
    setIsFullscreen,
    loadStarterFiles,
    updateFileContent,
    createFile,
    renameFile,
    deleteFile,
    openTab,
    closeTab,
    downloadProject,
    copyActiveCode,
  }
}
