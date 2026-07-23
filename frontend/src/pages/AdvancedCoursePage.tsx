import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LessonCompleteToast } from '../components/lesson/LessonCompleteToast';
import { LockedLessonToast } from '../components/lesson/LockedLessonToast';
import { useCopyProtection } from '../hooks/useCopyProtection';
import { useSpeechReader } from '../hooks/useSpeechReader';
import { useSelectedTextReader } from '../hooks/useSelectedTextReader';
import { useClickToRead } from '../hooks/useClickToRead';
import { speechService, normalizeBanglaLang } from '../services/speechService';
import {
  loadAudioSettings,
  saveAudioSettingsLocal,
  syncAudioSettingsToServer,
  loadAudioSettingsFromServer,
  type AudioSettings,
} from '../services/audioSettings';
import { useAuth } from '../context/AuthContext';
import { useCourseProgress } from '../hooks/useCourseProgress'
import { PracticeInIdeButton } from '../components/course/PracticeInIdeButton'
import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'
import { CourseProvider, CourseView, courseData, LessonFontSizeControl } from '../courses/advanced022';
import {
  Lock, X,
  ArrowLeft, ArrowRight, FileText, Trash2, Download, Edit3, Search, Trophy,
  Play, Square, Volume2, VolumeX,
} from 'lucide-react';

type LessonId =
  | 'hello-world'
  | 'variables'
  | 'errors'
  | 'loops'
  | 'lists'
  | 'functions'
  | 'class-object'
  | 'modules';

// ── Lesson <-> new-course chapter mapping ────────────────────────────
// The embedded advanced-section022 React course tracks chapters as
// "chapter-1".."chapter-8", in the SAME order as the LMS lessons below
// (hello-world..modules). These maps keep the LMS `currentLesson` and the new
// course's selected chapter in sync in both directions.
const LESSON_TO_CHAPTER_SLUG: Record<LessonId, string> = {
  'hello-world': 'chapter-1',
  variables: 'chapter-2',
  errors: 'chapter-3',
  loops: 'chapter-4',
  lists: 'chapter-5',
  functions: 'chapter-6',
  'class-object': 'chapter-7',
  modules: 'chapter-8',
};

const CHAPTER_SLUG_TO_LESSON: Record<string, LessonId> = Object.fromEntries(
  Object.entries(LESSON_TO_CHAPTER_SLUG).map(([lesson, slug]) => [slug, lesson as LessonId]),
) as Record<string, LessonId>;

const CHAPTER_ID_BY_SLUG: Record<string, string> = Object.fromEntries(
  courseData.chapters.map((ch) => [ch.slug, ch.id]),
);

// ── Original sub-lesson structure (source of truth = new course lessons) ──
// Each Advanced chapter is completed only after ALL of its sub-lessons are
// finished inside the embedded lesson files. These ids match the
// `data-subclass-id` values tracked by Begineer.js in localStorage
// ('capstone_python_progress'). We do NOT invent progress — we read it.
const SUB_LESSONS: Record<LessonId, string[]> = {
  'hello-world': ['c1_basic', 'c1_setting_up', 'c1_pattern', 'c1_initials', 'c1_snail_mail'],
  variables:     ['c2_basic', 'c2_data_types', 'c2_temperature', 'c2_bmi', 'c2_pythagorean', 'c2_currency'],
  errors:        ['c3_basic', 'c3_syntax_error', 'c3_name_error', 'c3_type_error'],
  loops:         ['c4_basic', 'c4_enter_pin', 'c4_guess_number', 'c4_99_bottles'],
  lists:         ['c5_basic', 'c5_grocery', 'c5_todo', 'c5_inventory'],
  functions:     ['c6_basic', 'c6_dry', 'c6_mars_orbiter', 'c6_calculator'],
  'class-object': ['c7_basic', 'c7_restuarent', 'c7_favorite_city', 'c7_bank_account'],
  modules:       ['c8_basic', 'c8_slot_machine', 'c8_countdown', 'c8_zen_of_python'],
};

const CAPSTONE_PROGRESS_KEY = 'capstone_python_progress'

interface LessonConfig {
  id: LessonId;
  label: string;
  title: string;
  duration: string;
}

const LESSONS: LessonConfig[] = [
  { id: 'hello-world', label: 'Class 01', title: 'Hello World (হ্যালো ওয়ার্ল্ড)', duration: '45 min' },
  { id: 'variables', label: 'Class 02', title: 'Variables (ভ্যারিয়েবলস)', duration: '45 min' },
  { id: 'errors', label: 'Class 03', title: 'Errors & Debugging (ত্রুটি ও সনাক্তকরণ)', duration: '45 min' },
  { id: 'loops', label: 'Class 04', title: 'Loops (লুপস)', duration: '45 min' },
  { id: 'lists', label: 'Class 05', title: 'Lists (লিস্টস)', duration: '45 min' },
  { id: 'functions', label: 'Class 06', title: 'Functions (ফাংশনস)', duration: '45 min' },
  { id: 'class-object', label: 'Class 07', title: 'Class & Object (ক্লাস ও অবজেক্ট)', duration: '45 min' },
  { id: 'modules', label: 'Class 08', title: 'Modules (মডিউলস)', duration: '45 min' },
];

const LESSON_ID_TO_MOCK_ID: Record<LessonId, string> = {
  'hello-world': 'advanced-hello-world',
  variables: 'advanced-variables',
  errors: 'advanced-errors',
  loops: 'advanced-loops',
  lists: 'advanced-lists',
  functions: 'advanced-functions',
  'class-object': 'advanced-class-object',
  modules: 'advanced-modules',
};

const NOTES_STORAGE_KEY = 'alokbartika_advanced_notes_v1'

type NotesMap = Record<string, { content: string; updatedAt: string }>

const S = {
  surface: '#0A4A3F', bg: '#04342C',
  accent: '#65D1B2', light: '#8FE3CC',
  text: '#F5F7F6', muted: '#B8C5C1',
}

function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function saveNotes(notes: NotesMap) {
  try { localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes)) } catch {}
}

// Resolve the `lesson` URL param to a valid LessonId. The Course List links
// with the mock id (e.g. "advanced-variables"), while direct links may use an
// order number or the bare lesson id. Falls back to the first lesson only when
// nothing valid is supplied.
const MOCK_ID_TO_LESSON: Record<string, LessonId> = Object.fromEntries(
  Object.entries(LESSON_ID_TO_MOCK_ID).map(([lesson, mock]) => [mock, lesson as LessonId]),
) as Record<string, LessonId>

function resolveLessonFromUrl(raw: string | null): LessonId | null {
  if (!raw) return null
  const asOrder = Number(raw)
  if (!Number.isNaN(asOrder) && asOrder >= 1 && asOrder <= LESSONS.length) {
    return LESSONS[asOrder - 1]?.id ?? null
  }
  if (raw in LESSON_ID_TO_MOCK_ID) return raw as LessonId
  if (raw in MOCK_ID_TO_LESSON) return MOCK_ID_TO_LESSON[raw]
  return null
}

// ── Main component ────────────────────────────────────────────────────
export function AdvancedCoursePage() {
  useCopyProtection();
  const [searchParams, setSearchParams] = useSearchParams()
  const initialLesson = resolveLessonFromUrl(searchParams.get('lesson')) ?? 'hello-world'
  const [currentLesson, setCurrentLesson] = useState<LessonId>(initialLesson);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [notesMap, setNotesMap] = useState<NotesMap>(loadNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll container ref (used by TTS, selected-text reader) ──
  const contentScrollRef = useRef<HTMLDivElement>(null)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)

  useEffect(() => {
    const el = contentScrollRef.current
    if (!el) return
    const onUserScroll = () => { setHasUserScrolled(true) }
    el.addEventListener('scroll', onUserScroll, { passive: true })
    return () => el.removeEventListener('scroll', onUserScroll)
  }, [])

  // ── Audio settings (persisted + synced) ──────────────────────────────
  const { token, user } = useAuth();
  const [settings, setSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const audioEnabled = settings.audioEnabled;
  const speed = settings.speed;

  const persistSettings = useCallback(
    (next: AudioSettings) => {
      setSettings(next);
      saveAudioSettingsLocal(next);
      void syncAudioSettingsToServer(next, token);
    },
    [token],
  );

  const tts = useSpeechReader({
    containerRef: contentScrollRef,
    scrollContainerRef: contentScrollRef,
    rate: speed,
  });

  const setAudioEnabledWithPersist = useCallback(
    (value: boolean) => {
      const next: AudioSettings = { ...settings, audioEnabled: value };
      persistSettings(next);
      if (!value) {
        tts.stop();
        speechService.stop();
      }
    },
    [settings, persistSettings, tts],
  );

  // Keep the reader's selected voice + speed aligned with persisted settings.
  useEffect(() => {
    if (settings.voice && settings.voice !== tts.selectedVoice) {
      tts.setVoice(settings.voice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.voice, tts.selectedVoice]);
  useEffect(() => {
    if (settings.speed !== tts.speed) {
      tts.setSpeed(settings.speed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.speed, tts.speed]);

  // Floating "Read" toolbar for selected text.
  const selectedText = useSelectedTextReader({
    containerRef: contentScrollRef,
    enabled: audioEnabled && !tts.isPlaying,
    ignoreSelector: ".alokbartika-paragraph-speaker, button, input, textarea, nav, footer",
  });

  // ── "Read from here" click-to-read feature ──
  const clickToRead = useClickToRead({
    containerRef: contentScrollRef,
    enabled: audioEnabled,
    onPlayFrom: tts.playFrom,
  });

  // ── Sync settings from server after login (best-effort) ──
  const didServerSync = useRef(false);
  useEffect(() => {
    if (!token || !user || didServerSync.current) return;
    didServerSync.current = true;
    loadAudioSettingsFromServer(loadAudioSettings(), token).then((merged) => {
      setSettings(merged);
      saveAudioSettingsLocal(merged);
    });
  }, [token, user]);

  // Persist the current advanced lesson so Continue Learning resumes to the exact
  // lesson across refresh / logout / different device (stored in MongoDB only).
  useEffect(() => {
    const mockId = LESSON_ID_TO_MOCK_ID[currentLesson]
    if (mockId) saveLastVisited(mockId, undefined, 'advanced')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson])

  useEffect(() => {
    setHasUserScrolled(false)
  }, [currentLesson])

  // ── Sync selected lesson with the URL (`?lesson=`) ─────────────────
  // Reacts to external deep links (Course List, Back/Exit) only. Internal
  // navigation already updates the URL via navigateToLesson, so this never
  // overrides an in-progress lesson change.
  useEffect(() => {
    const resolved = resolveLessonFromUrl(searchParams.get('lesson'))
    if (resolved && resolved !== currentLesson) {
      setCurrentLesson(resolved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ── Sub-lesson progress (source of truth = the embedded React course) ──
  // The embedded advanced-section022 course writes each completed sub-lesson to
  // localStorage['capstone_python_progress'] (keyed by cN_xxx ids) AND posts a
  // CAPSTONE_PROGRESS_UPDATED message — the SAME contract the old iframe used.
  // We REUSE that state instead of inventing progress: React only reflects what
  // the course sends, keeping all completion/unlock logic unchanged.

  // Lets the embedded course be driven from here (Prev/Next Class, deep links):
  // the CourseProvider stores its chapter-select setter in this ref.
  const chapterSelectRef = useRef<((chapterId: string) => void) | null>(null)

  const [capstone, setCapstone] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(CAPSTONE_PROGRESS_KEY) || '{}') } catch { return {} }
  })

  // Snapshot of capstone at lesson mount — restored localStorage values alone
  // must never satisfy completion; only fresh completions during this session count.
  const capstoneSnapshotRef = useRef<Record<string, string>>({})
  useEffect(() => {
    capstoneSnapshotRef.current = { ...capstone }
  }, [currentLesson])

  // Mirror progress sent in realtime from the embedded course (CourseContext
  // posts CAPSTONE_PROGRESS_UPDATED after each completeSubchapter()). The course
  // stays the single source of truth — React only reflects what it sends.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CAPSTONE_PROGRESS_UPDATED' && event.data.progress) {
        setCapstone(event.data.progress as Record<string, string>)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // ── Keyboard shortcuts (disabled while typing) ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!audioEnabled) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (tts.isPlaying && !tts.isPaused) tts.pause();
          else if (tts.isPaused) tts.resume();
          else tts.play();
          break;
        case 'Escape':
          e.preventDefault();
          tts.stop();
          break;
        case 'ArrowRight':
          e.preventDefault();
          tts.next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          tts.prev();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [audioEnabled, tts]);

  // Stop playback when the lesson changes.
  useEffect(() => {
    tts.stop();
    clickToRead.hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson]);

  // ── Auto-inject a speaker icon beside every readable paragraph ──
  useEffect(() => {
    const container = contentScrollRef.current;
    if (!container) return;

    const PARAGRAPH_SELECTOR = 'p, li, h1, h2, h3, h4, .tts-speak';
    const EXCLUDE = 'pre, code, .monaco-editor, button, input, textarea, select, .no-tts, [aria-hidden="true"], nav, footer, .lesson-navigation';
    const ICON_CLASS = 'alokbartika-paragraph-speaker';

    const removeIcons = () => {
      container.querySelectorAll(`.${ICON_CLASS}`).forEach((el) => el.remove());
    };

    if (!audioEnabled) {
      removeIcons();
      return;
    }

    const inject = () => {
      removeIcons();
      const blocks = Array.from(
        container.querySelectorAll<HTMLElement>(PARAGRAPH_SELECTOR),
      ).filter((el) => {
        if (!el.innerText || !el.innerText.trim()) return false;
        if (el.closest(EXCLUDE)) return false;
        if (el.classList.contains(ICON_CLASS)) return false;
        return true;
      });

      for (const block of blocks) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = ICON_CLASS;
        btn.setAttribute('aria-label', 'এই অংশটি শুনুন');
        btn.title = 'শুনুন';
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          speechService.stop();
          speechService.speak({
            text: block.innerText.trim(),
            lang: normalizeBanglaLang(block.lang || undefined),
          });
        });
        block.classList.add('tts-paragraph-anchor');
        block.appendChild(btn);
      }
    };

    const raf = requestAnimationFrame(inject);
    return () => {
      cancelAnimationFrame(raf);
      removeIcons();
    };
  }, [audioEnabled, currentLesson]);

  // Completion % of the CURRENT chapter's sub-lessons (drives the React bar).
  // PortalSystem.progress stores STRING states ("completed" | "in-progress" |
  // "not-started"). A sub-lesson counts ONLY when its value is exactly the
  // string "completed" — "in-progress" and "not-started" are ignored, and
  // missing/undefined ids count as not completed.
  const currentSubLessons = SUB_LESSONS[currentLesson]
  const completedSubCount = currentSubLessons.reduce(
    (n, id) => (capstone[id] === 'completed' ? n + 1 : n),
    0,
  )
  const totalSubLessons = currentSubLessons.length
  const allSubLessonsDone = completedSubCount === totalSubLessons

  // Require at least one fresh completion during this session — restored
  // localStorage state alone must never satisfy canComplete.
  const hadFreshCompletion = currentSubLessons.some(
    id => capstone[id] === 'completed' && capstoneSnapshotRef.current[id] !== 'completed',
  )

  const canComplete = allSubLessonsDone && hadFreshCompletion

  // ── Progress tracking (Advanced level) ───────────────────────────
  const lessonIds = useMemo(() => LESSONS.map(l => LESSON_ID_TO_MOCK_ID[l.id]), [])
  const classesByLevel = useMemo(() => ({
    beginner: [],
    intermediate: [],
    advanced: LESSONS.map(l => ({ id: LESSON_ID_TO_MOCK_ID[l.id] })),
  }), [])

  // We only need the Advanced course id to attribute completion to the right
  // course. Completion is now keyed by the canonical slug, so no alias map.
  const { data: advCoursesData } = useQuery({
    queryKey: ['adv-progress-courses'],
    queryFn: async () => (await fetch(`${API_BASE_URL}/courses`)).json(),
  })
  const advCourse = advCoursesData?.data?.find((c: any) => c.level === 'advanced')

  const {
    completedClassIds, isLessonUnlocked, markClassComplete, completeLevel, getLevelProgress, saveLastVisited, apiLoaded, completedLevels,
  } = useCourseProgress(classesByLevel, lessonIds)

  const lessonStates: Record<string, 'locked' | 'unlocked' | 'completed'> = {}
  for (const lesson of LESSONS) {
    const mockId = LESSON_ID_TO_MOCK_ID[lesson.id]
    if (completedClassIds.includes(mockId)) {
      lessonStates[mockId] = 'completed'
    } else if (isLessonUnlocked(mockId)) {
      lessonStates[mockId] = 'unlocked'
    } else {
      lessonStates[mockId] = 'locked'
    }
  }

  const isAdvancedCompleted = getLevelProgress('advanced') >= 100

  const lesson = LESSONS.find((l) => l.id === currentLesson)!;
  const mockId = LESSON_ID_TO_MOCK_ID[currentLesson]
  const currentMockId = mockId
  const isCurrentCompleted = completedClassIds.includes(mockId)

  // ── Locked chapters (display-only gating for the embedded course) ──
  // A chapter (= LMS lesson) is locked in the new course UI exactly when the
  // LMS says its lesson is locked. This mirrors the class-unlock logic; it does
  // NOT change progress.
  const lockedChapterSlugs = useMemo(() => {
    const set = new Set<string>()
    for (const l of LESSONS) {
      if (lessonStates[LESSON_ID_TO_MOCK_ID[l.id]] === 'locked') {
        set.add(LESSON_TO_CHAPTER_SLUG[l.id])
      }
    }
    return set
  }, [lessonStates])

  // ── Navigation helpers ────────────────────────────────────────────
  const currentIndex = LESSONS.findIndex(l => l.id === currentLesson)
  const prevLesson = currentIndex > 0 ? LESSONS[currentIndex - 1] : null
  const nextLesson = currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null
  const isFirstLesson = currentIndex <= 0
  const isLastLesson = currentIndex >= LESSONS.length - 1
  const isNextLocked = nextLesson
    ? (lessonStates[LESSON_ID_TO_MOCK_ID[nextLesson.id]] === 'locked' || !isCurrentCompleted)
    : true

  const navigateToLesson = useCallback((id: LessonId) => {
    setCurrentLesson(id)
    // Keep the URL `?lesson=` in sync so the URL-sync effect below never
    // resets currentLesson back to the previous lesson.
    setSearchParams({ lesson: LESSON_ID_TO_MOCK_ID[id] }, { replace: true })
    // Drive the embedded course to the matching chapter (Prev/Next Class, etc.).
    const chapterId = CHAPTER_ID_BY_SLUG[LESSON_TO_CHAPTER_SLUG[id]]
    if (chapterId) chapterSelectRef.current?.(chapterId)
    const contentArea = document.getElementById('advanced-content-scroll')
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setSearchParams])

  // Keep the embedded course's selected chapter in sync with currentLesson on
  // first mount and whenever it changes externally (deep links, URL sync).
  useEffect(() => {
    const chapterId = CHAPTER_ID_BY_SLUG[LESSON_TO_CHAPTER_SLUG[currentLesson]]
    if (chapterId) chapterSelectRef.current?.(chapterId)
  }, [currentLesson])

  // When the user navigates INTO a chapter from the embedded course UI, mirror
  // it back to currentLesson (and the URL) so the LMS chrome stays consistent.
  const handleCourseChapterSelect = useCallback((chapterSlug: string) => {
    const id = CHAPTER_SLUG_TO_LESSON[chapterSlug]
    if (!id) return
    setCurrentLesson(prev => {
      if (prev === id) return prev
      setSearchParams({ lesson: LESSON_ID_TO_MOCK_ID[id] }, { replace: true })
      return id
    })
  }, [setSearchParams])

  // ── Notes: load on lesson change ──────────────────────────────────
  useEffect(() => {
    setCurrentNoteText(notesMap[currentMockId]?.content || '')
    setSaveStatus('idle')
  }, [currentLesson, notesMap])

  // ── Notes: auto-save on text change ──────────────────────────────
  const handleNoteChange = (text: string) => {
    setCurrentNoteText(text)
    setSaveStatus('saving')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      const updated = { ...notesMap, [currentMockId]: { content: text, updatedAt: new Date().toISOString() } }
      setNotesMap(updated)
      saveNotes(updated)
      setSaveStatus('saved')
    }, 600)
  }

  const handleSaveNote = () => {
    const updated = { ...notesMap, [currentMockId]: { content: currentNoteText, updatedAt: new Date().toISOString() } }
    setNotesMap(updated)
    saveNotes(updated)
    setSaveStatus('saved')
  }

  const handleClearNote = () => {
    if (!currentNoteText.trim()) return
    if (window.confirm('আসলই কি এই নোটটি ডিলিট করতে চান?')) {
      setCurrentNoteText('')
      const updated = { ...notesMap }
      delete updated[currentMockId]
      setNotesMap(updated)
      saveNotes(updated)
      setSaveStatus('saved')
    }
  }

  const handleExportNotes = () => {
    let text = `অ্যাডভান্সড কোর্স নোট\nএক্সপোর্ট তারিখ: ${new Date().toLocaleDateString()}\n========================================\n\n`
    Object.entries(notesMap).forEach(([lId, note]) => {
      const l = LESSONS.find(lesson => LESSON_ID_TO_MOCK_ID[lesson.id] === lId)
      text += `পাঠ: ${l?.label} — ${l?.title || 'অজানা'}\n`
      text += `সর্বশেষ আপডেট: ${new Date(note.updatedAt).toLocaleString()}\n`
      text += `----------------------------------------\n`
      text += `${note.content}\n`
      text += `========================================\n\n`
    })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `advanced_notes.txt`
    link.title = 'নোট এক্সপোর্ট করুন'
    link.click()
    URL.revokeObjectURL(url)
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return Object.entries(notesMap)
      .map(([lId, note]) => {
        const l = LESSONS.find(lesson => LESSON_ID_TO_MOCK_ID[lesson.id] === lId)
        return { lessonId: lId, lessonTitle: l?.title || 'অজানা', content: note.content, updatedAt: note.updatedAt }
      })
      .filter(item => item.content.toLowerCase().includes(q) || item.lessonTitle.toLowerCase().includes(q))
  }, [searchQuery, notesMap])

  // ── Complete lesson handler ───────────────────────────────────────
  const handleCompleteLesson = () => {
    if (isCurrentCompleted || completingId) return
    setCompletingId(currentMockId)
    markClassComplete(currentMockId, advCourse?._id)

    setTimeout(() => {
      setCompletingId(null)
    }, 1200)
  }

  const [showCompleteToast, setShowCompleteToast] = useState(false)
  const [showLockedToast, setShowLockedToast] = useState(false)

  useEffect(() => {
    if (canComplete && !isCurrentCompleted && hasUserScrolled) {
      handleCompleteLesson()
      setShowCompleteToast(true)
    }
  }, [canComplete, isCurrentCompleted, hasUserScrolled])

  // ── Backend → local reconciliation (never lose progress) ───────────
  // useCourseProgress already merges the backend (GET /progression) with local
  // progress and exposes chapter (= LMS lesson) completion via completedClassIds.
  // The sub-lesson granularity lives ONLY in localStorage['capstone_python_progress'].
  // If the backend says a chapter is complete but the local sub-lessons for it are
  // missing (e.g. progress made on another device, or offline until now), backfill
  // those sub-lessons as "completed" locally so the merged state — and the progress
  // bar — reflect BOTH sources. This is a pure union (only ever adds), reuses the
  // existing capstone key + CAPSTONE_PROGRESS_UPDATED flow, and does not touch
  // markClassComplete / unlock / Final Exam logic. Re-runs whenever the backend
  // fetch resolves (completedClassIds changes), so it auto-syncs once the backend
  // becomes reachable again after being offline.
  useEffect(() => {
    const completedChapterMockIds = new Set<string>()
    for (const id of completedClassIds) {
      completedChapterMockIds.add(id)
    }

    let current: Record<string, string>
    try { current = JSON.parse(localStorage.getItem(CAPSTONE_PROGRESS_KEY) || '{}') } catch { current = {} }

    let changed = false
    for (const l of LESSONS) {
      const chapterMockId = LESSON_ID_TO_MOCK_ID[l.id]
      if (!completedChapterMockIds.has(chapterMockId)) continue
      for (const subId of SUB_LESSONS[l.id]) {
        if (current[subId] !== 'completed') {
          current[subId] = 'completed'
          changed = true
        }
      }
    }

    if (!changed) return

    try { localStorage.setItem(CAPSTONE_PROGRESS_KEY, JSON.stringify(current)) } catch {}
    setCapstone(current)
    try {
      window.postMessage(
        { type: 'CAPSTONE_PROGRESS_UPDATED', progress: current },
        window.location.origin,
      )
    } catch {}
  }, [completedClassIds])

  return (
    <div className="min-h-screen">
      <LessonCompleteToast
        show={showCompleteToast}
        isLevelCompleted={isLastLesson}
        nextLessonLabel={nextLesson?.title}
        onDismiss={() => setShowCompleteToast(false)}
      />
      <LockedLessonToast show={showLockedToast} onDismiss={() => setShowLockedToast(false)} />
      <div className="fixed inset-x-0 bottom-0 flex" style={{ top: '64px', zIndex: 30, backgroundColor: S.bg }}>
        {/* ── Main content area (full width — no sidebar) ── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Top toolbar ── */}
          <div className="px-4 py-3 shrink-0"
            style={{ backgroundColor: S.surface, borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
            {/* Top row: title + actions */}
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-black truncate flex-1" style={{ color: S.text }}>{lesson.title}</h1>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Lesson size (advanced022) — scales the entire embedded
                    lesson container (.lesson-size-*) only; persists via the
                    advanced022_lesson_size localStorage key. */}
                <LessonFontSizeControl />
                {/* Audio Learning cluster — inline on desktop, sticky bottom on mobile */}
                <div
                  className="flex flex-wrap items-center justify-center gap-1.5 fixed inset-x-0 bottom-0 left-0 right-0 z-40 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] border-t shadow-[0_-6px_20px_rgba(0,0,0,0.2)] md:static md:inset-auto md:z-auto md:flex-nowrap md:justify-start md:border-0 md:shadow-none md:px-0 md:py-0 md:flex-none audio-player-bar"
                  style={{ backgroundColor: S.surface, borderColor: 'rgba(101,209,178,0.12)' }}
                >
                  <button
                    onClick={() => setAudioEnabledWithPersist(!audioEnabled)}
                    aria-pressed={audioEnabled}
                    aria-label={audioEnabled ? 'অডিও রিডিং বন্ধ করুন' : 'অডিও রিডিং চালু করুন'}
                    title="অডিও রিডিং চালু/বন্ধ"
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D1B2] min-h-[44px] md:min-h-0"
                    style={{
                      borderColor: audioEnabled ? 'rgba(101,209,178,0.4)' : 'rgba(255,255,255,0.12)',
                      backgroundColor: audioEnabled ? 'rgba(101,209,178,0.12)' : 'transparent',
                      color: audioEnabled ? S.accent : S.muted,
                    }}
                  >
                    {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span
                      className="ml-1 inline-flex h-4 w-8 items-center rounded-full px-0.5 transition-colors"
                      style={{ backgroundColor: audioEnabled ? S.accent : 'rgba(255,255,255,0.2)' }}
                      aria-hidden="true"
                    >
                      <span
                        className="block h-3 w-3 rounded-full bg-white transition-transform"
                        style={{ transform: audioEnabled ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </span>
                  </button>
                  {audioEnabled && tts.supported && (
                    <div className="flex items-center gap-1 rounded-xl border px-1 py-0.5"
                      style={{ borderColor: 'rgba(101,209,178,0.2)', backgroundColor: 'rgba(101,209,178,0.05)' }}>
                      {!tts.isPlaying ? (
                        <button
                          onClick={tts.play}
                          aria-label="পাঠ শুনুন"
                          title="পাঠ শুনুন"
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold min-h-[44px] md:min-h-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D1B2]"
                          style={{ backgroundColor: 'rgba(101,209,178,0.08)', color: S.accent }}
                        >
                          <Play size={14} fill="currentColor" />
                          <span className="hidden md:inline">পাঠ শুনুন</span>
                        </button>
                      ) : (
                        <button
                          onClick={tts.stop}
                          aria-label="বন্ধ করুন"
                          title="বন্ধ করুন"
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-red-500 min-h-[44px] md:min-h-0 transition-all hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Square size={12} fill="currentColor" />
                          <span className="hidden md:inline">বন্ধ করুন</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {/* Notes toggle */}
                <button
                  onClick={() => setNotesPanelOpen(!notesPanelOpen)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{
                    color: notesPanelOpen ? '#04342C' : S.muted,
                    backgroundColor: notesPanelOpen ? S.accent : 'transparent',
                  }}
                >
                  <FileText size={14} /> আমার নোট
                </button>
                {/* Exit — leave Advanced completely */}
                <Link to="/courses?level=advanced" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: S.muted }}>
                  <X size={14} /> কোর্স থেকে বের হন
                </Link>
              </div>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div ref={contentScrollRef} id="advanced-content-scroll" className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <div className="flex justify-center">
              <div
                className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-8 space-y-6"
                style={{ maxWidth: 'none', transition: 'all 200ms' }}
              >
                {(
                  <>
                    {/* ── Embedded React Advanced course ──
                        Renders the advanced-section022 course (Home -> Chapter ->
                        Lesson) in place of the old iframe. Completion is written
                        to localStorage['capstone_python_progress'] + posted as
                        CAPSTONE_PROGRESS_UPDATED, which the message listener above
                        reflects into `capstone` — so all LMS unlock/completion
                        logic stays unchanged. */}
                    <div
                      className="w-full rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(101,209,178,0.15)', backgroundColor: '#fff' }}
                    >
                      <CourseProvider
                        onSubchapterComplete={() => {}}
                        onChapterSelect={handleCourseChapterSelect}
                        chapterSelectRef={chapterSelectRef}
                      >
                        <CourseView lockedChapterSlugs={lockedChapterSlugs} />
                      </CourseProvider>
                    </div>

                    {/* ── React Previous / Practice / Next row ──
                        This row is the ONLY class-level navigation, reusing the
                        existing prev/next handlers and completion/unlock logic. */}
                    <div className="flex items-stretch justify-between gap-3 pb-4 pt-4">
                      {/* Previous */}
                      {isFirstLesson ? (
                        <button
                          disabled
                          className="flex flex-col items-start gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-not-allowed"
                          style={{ backgroundColor: 'rgba(101,209,178,0.05)', color: 'rgba(184,197,193,0.35)', border: '1px solid rgba(101,209,178,0.08)' }}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: S.muted }}>পূর্ববর্তী ক্লাস</span>
                          <span className="flex items-center gap-2"><ArrowLeft size={16} /> —</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { if (prevLesson) navigateToLesson(prevLesson.id) }}
                          className="flex flex-col items-start gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                          style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.muted, border: '1px solid rgba(101,209,178,0.08)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.18)'; (e.currentTarget as HTMLElement).style.color = S.accent }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.10)'; (e.currentTarget as HTMLElement).style.color = S.muted }}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: S.accent }}>পূর্ববর্তী ক্লাস</span>
                          <span className="flex items-center gap-2 text-left"><ArrowLeft size={16} /> {prevLesson?.title}</span>
                        </button>
                      )}

                      {/* Practice in IDE */}
                      <PracticeInIdeButton />

                      {/* Next */}
                      {isLastLesson ? (
                        completedLevels?.includes('advanced') ? (
                          <Link
                            to="/exam-review/advanced"
                            className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: `1px solid ${S.accent}` }}
                          >
                            <span>✅ পরীক্ষায় পাস করেছে</span>
                            <span className="text-xs underline">পর্যালোচনা</span>
                          </Link>
                        ) : isAdvancedCompleted ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                            style={{ backgroundColor: S.accent, color: '#04342C', border: `1px solid ${S.accent}` }}
                          >
                            <Link to="/exam/advanced" className="flex items-center gap-2 text-left">
                              <Trophy className="w-4 h-4" />
                              <span>চূড়ান্ত পরীক্ষা দিন</span>
                            </Link>
                          </motion.button>
                        ) : (
                          <div className="relative group">
                            <button
                              disabled
                              className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl border cursor-not-allowed"
                              style={{ borderColor: 'rgba(101,209,178,0.12)', color: 'rgba(184,197,193,0.5)', backgroundColor: 'rgba(101,209,178,0.05)' }}
                            >
                              <Lock className="w-4 h-4" />
                              <span className="text-sm font-bold">চূড়ান্ত পরীক্ষা দিন (লক)</span>
                            </button>
                            <span className="absolute bottom-full mb-2 right-0 w-56 text-center text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                              style={{ backgroundColor: '#2F3A35', color: '#FFFDF8' }}>
                              সকল ক্লাস সম্পন্ন করলে ফাইনাল পরীক্ষা আনলক হবে।
                            </span>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            if (!nextLesson) return
                            if (isCurrentCompleted) navigateToLesson(nextLesson.id)
                            else handleCompleteLesson()
                          }}
                          disabled={!nextLesson}
                          className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                          style={{
                            backgroundColor: !nextLesson ? 'rgba(101,209,178,0.05)' : 'rgba(101,209,178,0.10)',
                            color: !nextLesson ? 'rgba(184,197,193,0.35)' : S.muted,
                            cursor: !nextLesson ? 'not-allowed' : 'pointer',
                            border: '1px solid rgba(101,209,178,0.08)',
                          }}
                          onMouseEnter={e => { if (nextLesson) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.18)'; (e.currentTarget as HTMLElement).style.color = S.accent } }}
                          onMouseLeave={e => { if (nextLesson) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.10)'; (e.currentTarget as HTMLElement).style.color = S.muted } }}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: S.accent }}>পরবর্তী ক্লাস</span>
                          <span className="flex items-center gap-2 text-right">{nextLesson?.title} <ArrowRight size={16} /></span>
                        </button>
                      )}
                    </div>

                    {/* ── Final Exam CTA (only on the last lesson) ──
                        Handled inside the React nav row above, so no separate
                        CTA is rendered here. */}

                    {/* ── Completion toast ── */}
                    {completingId === currentMockId && (
                      <div className="toast toast-top toast-center z-[100]">
                        <div className="px-8 py-5 rounded-2xl font-black text-lg animate-bounce"
                          style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 32px rgba(101,209,178,0.40)' }}>
                          🎉 আপনি XP অর্জন করেছেন!
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Floating "Read" toolbar for selected text */}
        {selectedText.toolbar.visible && (
          <div
            className="fixed z-[60] flex items-center gap-1 rounded-xl border px-1.5 py-1 shadow-lg max-w-[92vw]"
            style={{
              left: selectedText.toolbar.x,
              top: selectedText.toolbar.y,
              transform: "translateX(-50%)",
              backgroundColor: S.surface,
              borderColor: "rgba(101,209,178,0.3)",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <button
              onClick={selectedText.readSelection}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all min-h-[40px]"
              style={{ backgroundColor: "rgba(101,209,178,0.12)", color: S.accent }}
              title="নির্বাচিত অংশ শুনুন"
              aria-label="নির্বাচিত অংশ শুনুন"
            >
              <Volume2 size={13} />
              <span>শুনুন</span>
            </button>
            <button
              onClick={selectedText.hide}
              className="rounded-lg p-1 transition-all hover:bg-white/5"
              style={{ color: S.muted }}
              title="বন্ধ করুন"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Floating "Read from here" button */}
        {clickToRead.popup.visible && (
          <button
            className="click-to-read-popup fixed z-[60] flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              left: clickToRead.popup.x,
              top: clickToRead.popup.y,
              backgroundColor: S.surface,
              borderColor: "rgba(101,209,178,0.3)",
              color: S.accent,
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              minHeight: "40px",
            }}
            onClick={clickToRead.handlePlayFromClick}
            aria-label="এখান থেকে শুনুন"
          >
            <Play size={13} fill="currentColor" />
            <span>এখান থেকে শুনুন</span>
          </button>
        )}

        {/* ── My Notes Slide-in Panel ── */}
        <div
          className="fixed top-16 right-0 bottom-0 flex flex-col z-[60] transition-transform duration-300"
          style={{
            width: '360px',
            transform: notesPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            backgroundColor: '#04342C',
            borderLeft: '1px solid rgba(101,209,178,0.15)',
            boxShadow: notesPanelOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
            <div className="flex items-center gap-2">
              <Edit3 size={15} style={{ color: S.accent }} />
              <span className="font-black text-sm" style={{ color: S.text }}>আমার নোট</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}>
                {Object.keys(notesMap).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Object.keys(notesMap).length > 0 && (
                <button onClick={handleExportNotes}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: S.muted }} title="সকল নোট .txt হিসেবে এক্সপোর্ট করুন">
                  <Download size={14} />
                </button>
              )}
              <button onClick={() => setNotesPanelOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: S.muted }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(101,209,178,0.08)' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(101,209,178,0.05)', border: '1px solid rgba(101,209,178,0.10)' }}>
              <Search size={13} style={{ color: S.muted }} />
              <input
                type="text" placeholder="নোট খুঁজুন..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs font-medium" style={{ color: S.text }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: S.muted }}><X size={12} /></button>
              )}
            </div>
          </div>

          {searchQuery ? (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {searchResults.length === 0 ? (
                <div className="text-center py-8" style={{ color: S.muted, opacity: 0.5 }}>
                  <Search size={24} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold">কোন মিল পাওয়া যায়নি</p>
                </div>
              ) : searchResults.map(result => (
                <div key={result.lessonId}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: 'rgba(101,209,178,0.05)', border: '1px solid rgba(101,209,178,0.10)' }}
                  onClick={() => {
                    setSearchQuery('')
                    const found = LESSONS.find(l => LESSON_ID_TO_MOCK_ID[l.id] === result.lessonId)
                    if (found) navigateToLesson(found.id)
                  }}
                >
                  <p className="text-[11px] font-black mb-1" style={{ color: S.accent }}>{result.lessonTitle}</p>
                  <p className="text-xs line-clamp-3 font-medium" style={{ color: S.muted }}>{result.content}</p>
                  <p className="text-[10px] mt-2 font-bold" style={{ color: 'rgba(101,209,178,0.4)' }}>
                    {new Date(result.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-3 pt-3 pb-2 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(101,209,178,0.4)' }}>
                  বর্তমান পাঠ
                </p>
                <p className="text-xs font-bold truncate" style={{ color: S.accent }}>
                  {lesson.label}: {lesson.title}
                </p>
              </div>

              <div className="flex-1 px-3 pb-2 min-h-0">
                <textarea
                  value={currentNoteText}
                  onChange={e => handleNoteChange(e.target.value)}
                  placeholder="এখানে নোট লিখুন... (Auto-save চালু আছে)"
                  className="w-full h-full resize-none outline-none rounded-xl p-3 text-sm leading-relaxed font-medium"
                  style={{
                    backgroundColor: 'rgba(101,209,178,0.04)',
                    border: '1px solid rgba(101,209,178,0.12)',
                    color: S.text,
                    fontFamily: "'Hind Siliguri', sans-serif",
                    minHeight: '180px',
                  }}
                />
              </div>

              <div className="px-3 py-2 shrink-0 flex items-center justify-between gap-2 flex-wrap"
                style={{ borderTop: '1px solid rgba(101,209,178,0.08)' }}>
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveNote}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: S.accent, backgroundColor: 'rgba(101,209,178,0.10)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.20)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.10)' }}
                  >
                    নোট সংরক্ষণ করুন
                  </button>
                  <span className="text-[10px] font-bold"
                    style={{ color: saveStatus === 'saved' ? S.accent : saveStatus === 'saving' ? '#f5c842' : 'transparent' }}>
                    {saveStatus === 'saved' ? '✓ সংরক্ষিত' : saveStatus === 'saving' ? '⏳ সংরক্ষণ হচ্ছে…' : ''}
                  </span>
                </div>
                {currentNoteText.trim() && (
                  <button onClick={handleClearNote}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                    style={{ color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.18)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.08)' }}
                  >
                    <Trash2 size={11} /> মুছুন
                  </button>
                )}
              </div>

              {/* All notes list */}
              {Object.keys(notesMap).length > 0 && (
                <div className="px-3 pb-3 shrink-0 overflow-y-auto" style={{ maxHeight: '200px', borderTop: '1px solid rgba(101,209,178,0.08)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest pt-3 pb-2" style={{ color: 'rgba(101,209,178,0.4)' }}>
                    সকল নোট ({Object.keys(notesMap).length})
                  </p>
                  <div className="space-y-2">
                    {Object.entries(notesMap).map(([lId, note]) => {
                      const l = LESSONS.find(lesson => LESSON_ID_TO_MOCK_ID[lesson.id] === lId)
                      const isThisLesson = lId === currentMockId
                      return (
                        <div key={lId} onClick={() => { if (l) navigateToLesson(l.id) }}
                          className="p-2.5 rounded-lg cursor-pointer transition-all"
                          style={{
                            backgroundColor: isThisLesson ? 'rgba(101,209,178,0.10)' : 'rgba(101,209,178,0.03)',
                            border: `1px solid ${isThisLesson ? 'rgba(101,209,178,0.20)' : 'rgba(101,209,178,0.07)'}`,
                          }}>
                          <p className="text-[10px] font-black mb-0.5 truncate" style={{ color: isThisLesson ? S.accent : S.muted }}>
                            {l?.title || 'অজানা'}
                          </p>
                          <p className="text-[10px] line-clamp-2 font-medium" style={{ color: 'rgba(184,197,193,0.6)' }}>
                            {note.content}
                          </p>
                          <p className="text-[9px] mt-1 font-bold" style={{ color: 'rgba(101,209,178,0.3)' }}>
                            {new Date(note.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
