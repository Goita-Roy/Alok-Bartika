import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronRight,
  ArrowLeft, X, Lock, FileText, Trash2, Download, Edit3, Search, CheckCircle2,
} from "lucide-react";
import { lessonClasses } from "../../components/beginner-content/lessonConfig";
import { classComponents } from "./BeginnerClassPage";
import ScrollContext from "../../components/beginner-content/ScrollContext";
import { useCopyProtection } from "../../hooks/useCopyProtection";
import { useSpeechReader } from "../../hooks/useSpeechReader";
import { useSelectedTextReader } from "../../hooks/useSelectedTextReader";
import { useClickToRead } from "../../hooks/useClickToRead";
import { Play, Square, Volume2, VolumeX } from "lucide-react";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { LockedLessonToast } from "../../components/lesson/LockedLessonToast";
import { speechService, normalizeBanglaLang } from "../../services/speechService";
import {
  loadAudioSettings,
  saveAudioSettingsLocal,
  syncAudioSettingsToServer,
  loadAudioSettingsFromServer,
  type AudioSettings,
} from "../../services/audioSettings";
import { useAuth } from "../../context/AuthContext";
import PendingCompletionContext from "../../components/beginner-content/PendingCompletionContext";

import { useTheme } from "../../context/ThemeContext";

function useP() {
  const { theme } = useTheme();
  return theme === 'light' ? {
    bg: "#FBF8F1",
    surface: "#E8F4F1",
    surfaceAlt: "#FFFFFF",
    accent: "#0E7C66",
    light: "#D8F0E8",
    text: "#2F3A35",
    muted: "#5C665F",
    border: "#D5E8E2",
  } : {
    bg: "#0f0c29",          // Keep original dark purple theme for dark mode
    surface: "#1a1040",
    surfaceAlt: "#0d2137",
    accent: "#c084fc",
    light: "#a78bfa",
    text: "#f1f5f9",
    muted: "#94a3b8",
    border: "rgba(255,255,255,0.1)",
  };
}

const READING_SIZE_KEY = "alokbartika_beginner_reading_size";
const READING_PRESETS = [
  { label: "S", value: 0.85, name: "ছোট" },
  { label: "M", value: 1.0, name: "মাঝারি" },
  { label: "L", value: 1.15, name: "বড়" },
] as const;

const classDescriptions: Record<string, string> = {
  "class-01": "কম্পিউটার কী, এর ইতিহাস, প্রকারভেদ ও ব্যবহার সম্পর্কে বিস্তারিত জানুন।",
  "class-02": "CPU বা সেন্ট্রাল প্রসেসিং ইউনিট কীভাবে কম্পিউটারের মস্তিষ্ক হিসেবে কাজ করে তা শিখুন।",
  "class-03": "RAM বা মেমোরি কী, এটি কীভাবে অস্থায়ী ডেটা সংরক্ষণ করে তা বুঝুন।",
  "class-04": "স্টোরেজ ডিভাইসের মাধ্যমে স্থায়ীভাবে ডেটা সংরক্ষণের পদ্ধতি জানুন।",
  "class-05": "কীবোর্ড, মাউস, স্ক্যানার - ইনপুট ডিভাইসগুলোর কাজ ও ব্যবহার শিখুন।",
  "class-06": "মনিটর, প্রিন্টার, স্পিকার - আউটপুট ডিভাইসগুলোর কাজ ও ব্যবহার জানুন।",
  "class-07": "সফটওয়্যার কী, এর প্রকারভেদ ও গুরুত্ব সম্পর্কে বিস্তারিত জানুন।",
  "class-08": "অপারেটিং সিস্টেম কীভাবে কম্পিউটার পরিচালনা করে তা শিখুন।",
  "class-09": "ইন্টারনেটের ইতিহাস, কাজের পদ্ধতি ও তথ্যের সমুদ্র সম্পর্কে জানুন।",
  "class-10": "সাইবার নিরাপত্তার গুরুত্ব ও অনলাইনে সুরক্ষিত থাকার উপায় শিখুন।",
};

const NOTES_STORAGE_KEY = 'alokbartika_beginner_notes_v1'
const WELCOME_STORAGE_KEY = 'alokbartika_beginner_welcome_seen'

type NotesMap = Record<string, { content: string; updatedAt: string }>

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

// ── Class Card ──
function ClassCard({ cls, index, onSelect, isLocked, isCompleted, onLockedClick }: { cls: typeof lessonClasses[0]; index: number; onSelect: (id: string) => void; isLocked: boolean; isCompleted?: boolean; onLockedClick: () => void }) {
  const P = useP();
  return (
    <motion.button
      onClick={() => { if (isLocked) { onLockedClick(); return; } onSelect(cls.id); }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative w-full text-left overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        background: isCompleted ? "rgba(15, 118, 110, 0.22)" : "rgba(255,255,255,0.06)",
        borderColor: isCompleted ? P.accent : P.border,
        backdropFilter: "blur(12px)",
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? "not-allowed" : "pointer",
      }}
      whileHover={isLocked ? {} : { scale: 1.03, y: -2 }}
      onMouseEnter={(e) => {
        if (isLocked) return;
        (e.currentTarget as HTMLElement).style.borderColor = P.accent;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${P.accent}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = isCompleted ? P.accent : P.border;
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
              style={{
                background: isLocked
                  ? "rgba(255,255,255,0.05)"
                  : isCompleted
                  ? P.accent
                  : `linear-gradient(135deg, ${P.accent}33, ${P.light}22)`,
                color: isLocked ? P.muted : isCompleted ? "#FFFFFF" : P.accent,
              }}
            >
              {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle2 size={18} /> : index + 1}
            </span>
            <h3 className="text-base font-bold leading-snug" style={{ color: isLocked ? P.muted : P.text }}>
              {cls.title}
            </h3>
          </div>
          {isLocked ? (
            <Lock size={18} style={{ color: P.muted }} className="shrink-0 opacity-50" />
          ) : (
            <ChevronRight size={18} style={{ color: P.muted }} className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <p className="text-sm leading-relaxed line-clamp-2 ml-12" style={{ color: P.muted }}>
          {isLocked ? "আগার ক্লাস সম্পন্ন করলে আনলক হবে" : classDescriptions[cls.id]}
        </p>
      </div>
    </motion.button>
  );
}

// ── Main page ──
export default function BeginnerCoursePage() {
  useCopyProtection();
  const P = useP();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [selectedClass, setSelectedClass] = useState<string | null>(classId || null);
  const [readingSize, setReadingSize] = useState(() => {
    try {
      const saved = localStorage.getItem(READING_SIZE_KEY);
      if (saved) return parseFloat(saved);
    } catch {}
    return 1;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingCompletionRef = useRef<Promise<void> | null>(null);
  const { token, user } = useAuth();

  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [notesMap, setNotesMap] = useState<NotesMap>(loadNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true'; } catch { return true; }
  });
  const [welcomeChecked, setWelcomeChecked] = useState(false);

  const handleWelcomeDone = useCallback(() => {
    try { localStorage.setItem(WELCOME_STORAGE_KEY, 'true'); } catch {}
    setShowWelcome(false);
  }, []);

  // ── Audio settings (persisted + synced) ──
  const [settings, setSettings] = useState<AudioSettings>(() => loadAudioSettings());
  const audioEnabled = settings.audioEnabled;
  const speed = settings.speed;

  const persistSettings = useCallback(
    (next: AudioSettings) => {
      setSettings(next);
      saveAudioSettingsLocal(next);
      // Best-effort server sync (no-op if endpoint absent).
      void syncAudioSettingsToServer(next, token);
    },
    [token],
  );

  const tts = useSpeechReader({
    containerRef: scrollRef,
    scrollContainerRef: scrollRef,
    rate: speed,
  });

  const setAudioEnabledWithPersist = useCallback(
    (value: boolean) => {
      const next: AudioSettings = { ...settings, audioEnabled: value };
      persistSettings(next);
      if (!value) {
        // Turning audio OFF must stop any playback immediately.
        tts.stop();
        speechService.stop();
      }
    },
    [settings, persistSettings, tts],
  );

  const setSpeedWithPersist = useCallback(
    (value: number) => {
      persistSettings({ ...settings, speed: value });
    },
    [settings, persistSettings],
  );

  const setVoiceWithPersist = useCallback(
    (voice: string) => {
      persistSettings({ ...settings, voice });
    },
    [settings, persistSettings],
  );

  const validIds = lessonClasses.map((c) => c.id);

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

  // Floating "Read" toolbar for selected text (only when audio is ON and not
  // currently reading the whole lesson — karaoke sets its own selection).
  const selectedText = useSelectedTextReader({
    containerRef: scrollRef,
    enabled: audioEnabled && !tts.isPlaying,
    ignoreSelector: ".alokbartika-paragraph-speaker, button, input, textarea, nav, footer",
  });

  // ── "Read from here" click-to-read feature ──
  const clickToRead = useClickToRead({
    containerRef: scrollRef,
    enabled: audioEnabled,
    onPlayFrom: tts.playFrom,
  });

  // ── Sync settings from server after login (best-effort) ──
  const didServerSync = useRef(false)
  useEffect(() => {
    if (!token || !user || didServerSync.current) return
    didServerSync.current = true
    loadAudioSettingsFromServer(loadAudioSettings(), token).then((merged) => {
      setSettings(merged)
      saveAudioSettingsLocal(merged)
    })
  }, [token, user])

  // ── Keyboard shortcuts (disabled while typing) ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!audioEnabled) return
      const target = e.target as HTMLElement
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (tts.isPlaying && !tts.isPaused) tts.pause()
          else if (tts.isPaused) tts.resume()
          else tts.play()
          break
        case 'Escape':
          e.preventDefault()
          tts.stop()
          break
        case 'ArrowRight':
          e.preventDefault()
          tts.next()
          break
        case 'ArrowLeft':
          e.preventDefault()
          tts.prev()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [audioEnabled, tts])

  const handleReadingSize = (value: number) => {
    setReadingSize(value);
    try { localStorage.setItem(READING_SIZE_KEY, String(value)); } catch {}
  };

  // ── Progress tracking ──
  const beginnerLessonIds = useMemo(() => lessonClasses.map(c => c.id), []);
  const classesByLevel = useMemo(() => ({
    beginner: lessonClasses.map(c => ({ id: c.id })),
    intermediate: [],
    advanced: [],
  }), []);

  const { completedClassIds, isLessonUnlocked, apiLoaded, saveLastVisited } = useCourseProgress(classesByLevel, beginnerLessonIds);

  console.log('[DEBUG:BeginnerCoursePage] render — selectedClass:', selectedClass, 'completedClassIds:', completedClassIds)

  const lessonStates = useMemo(() => {
    const states: Record<string, 'locked' | 'unlocked' | 'completed'> = {};
    for (const cls of lessonClasses) {
      if (completedClassIds.includes(cls.id)) {
        states[cls.id] = 'completed';
      } else if (isLessonUnlocked(cls.id)) {
        states[cls.id] = 'unlocked';
      } else {
        states[cls.id] = 'locked';
      }
    }
    return states;
  }, [completedClassIds, isLessonUnlocked]);

  const [showLockedToast, setShowLockedToast] = useState(false);

  const lesson = selectedClass ? lessonClasses.find((c) => c.id === selectedClass) : null;
  const currentMockId = selectedClass || '';

  // ── Notes: load on lesson change ──────────────────────────────────
  useEffect(() => {
    setCurrentNoteText(notesMap[currentMockId]?.content || '')
    setSaveStatus('idle')
  }, [currentMockId, notesMap])

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
    let text = `বিগিনার কোর্স নোট\nএক্সপোর্ট তারিখ: ${new Date().toLocaleDateString()}\n========================================\n\n`
    Object.entries(notesMap).forEach(([lId, note]) => {
      const l = lessonClasses.find(c => c.id === lId)
      text += `পাঠ: ${l?.title || 'অজানা'}\n`
      text += `সর্বশেষ আপডেট: ${new Date(note.updatedAt).toLocaleString()}\n`
      text += `----------------------------------------\n`
      text += `${note.content}\n`
      text += `========================================\n\n`
    })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `beginner_notes.txt`
    link.title = 'নোট এক্সপোর্ট করুন'
    link.click()
    URL.revokeObjectURL(url)
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return Object.entries(notesMap)
      .map(([lId, note]) => {
        const l = lessonClasses.find(c => c.id === lId)
        return { lessonId: lId, lessonTitle: l?.title || 'অজানা', content: note.content, updatedAt: note.updatedAt }
      })
      .filter(item => item.content.toLowerCase().includes(q) || item.lessonTitle.toLowerCase().includes(q))
  }, [searchQuery, notesMap])

  // ── Notes: Ctrl+S shortcut ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault()
        if (currentMockId) handleSaveNote()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentMockId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset scroll position when navigating to a different class so the new
  // lesson opens from the top instead of wherever the previous class was
  // scrolled to.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedClass]);

  useEffect(() => {
    tts.stop();
    clickToRead.hide();
  }, [selectedClass]);

  // ── Auto-inject a speaker icon beside every readable paragraph ──
  // Runs only when audio is enabled. When disabled, any existing icons are
  // removed and no new ones are created. Lesson source files are untouched;
  // icons are DOM nodes added/removed at runtime.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const PARAGRAPH_SELECTOR = 'p, li, h1, h2, h3, h4, .tts-speak';
    const EXCLUDE = 'pre, code, .monaco-editor, button, input, textarea, select, .no-tts, [aria-hidden="true"], nav, footer, .lesson-navigation, .beginner-lesson-navigation';
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
        // Avoid nesting an icon inside an icon.
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

    // Inject after the lesson content has rendered.
    const raf = requestAnimationFrame(inject);
    return () => {
      cancelAnimationFrame(raf);
      removeIcons();
    };
  }, [audioEnabled, selectedClass]);

  useEffect(() => {
    if (classId && validIds.includes(classId)) {
      setSelectedClass(classId);
    }
  }, [classId]);

  const prevSelectedRef = useRef(selectedClass);
  useEffect(() => {
    prevSelectedRef.current = selectedClass;
  }, [selectedClass]);

  const handleSelectClass = useCallback((id: string) => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setSelectedClass(id);
    saveLastVisited(id, undefined, 'beginner');
    navigate(`/courses/beginner/${id}`, { replace: true });
  }, [navigate, saveLastVisited]);

  const handleGoBack = useCallback(async () => {
    if (pendingCompletionRef.current) {
      await pendingCompletionRef.current;
    }
    setSelectedClass(null);
    navigate("/courses/beginner", { replace: true });
  }, [navigate]);

  const handleExitCourse = useCallback(async () => {
    if (pendingCompletionRef.current) {
      await pendingCompletionRef.current;
    }
    navigate("/courses?level=beginner");
  }, [navigate]);

  return (
    <PendingCompletionContext.Provider value={pendingCompletionRef}>
    {showWelcome && !selectedClass && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-lg rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
          style={{ backgroundColor: P.surfaceAlt, border: `1px solid ${P.border}` }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📘</span>
              <h2 className="text-lg font-black" style={{ color: P.text }}>আলোকবার্তিকা – Beginner Level এ স্বাগতম!</h2>
            </div>
            <p className="text-sm font-medium mb-5" style={{ color: P.muted }}>এই কোর্সটি শুরু করার আগে অনুগ্রহ করে নিচের নির্দেশনাগুলো পড়ুন।</p>
            <ul className="space-y-3 mb-6">
              {[
                'প্রতিটি পাঠ মনোযোগ দিয়ে সম্পূর্ণ করুন।',
                'চাইলে Voice শুনে পাঠ শিখতে পারবেন।',
                'প্রতিটি পাঠে নিজের নোট লিখে সংরক্ষণ করতে পারবেন।',
                'প্রতিটি পাঠের কার্যক্রম, অনুশীলন ও কুইজ সম্পন্ন করুন।',
                'সব Beginner পাঠ সম্পূর্ণ করার পর Final Exam আনলক হবে।',
                'Final Exam সফলভাবে পাস করলে Intermediate Level আনলক হবে।',
                'কোনো পাঠ, কনটেন্ট বা প্রযুক্তিগত সমস্যার সম্মুখীন হলে আমাদের সাথে যোগাযোগ করুন।',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-medium" style={{ color: P.text }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black" style={{ backgroundColor: `${P.accent}18`, color: P.accent }}>{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-5" style={{ backgroundColor: `${P.accent}0A`, border: `1px solid ${welcomeChecked ? P.accent : P.border}` }}>
              <input
                type="checkbox"
                checked={welcomeChecked}
                onChange={(e) => setWelcomeChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[#0E7C66]"
              />
              <span className="text-sm font-bold" style={{ color: P.text }}>আমি নির্দেশনাগুলো পড়েছি এবং কোর্স শুরু করতে প্রস্তুত।</span>
            </label>
            <button
              onClick={handleWelcomeDone}
              disabled={!welcomeChecked}
              className="w-full py-3 rounded-xl font-black text-sm transition-all duration-200 disabled:opacity-40"
              style={{
                backgroundColor: welcomeChecked ? '#0E7C66' : '#B8C5C1',
                color: '#FFFDF8',
              }}
            >
              শুরু করুন
            </button>
          </div>
        </motion.div>
      </div>
    )}
    <div className="fixed inset-x-0 bottom-0 flex" style={{ top: "64px", zIndex: 30, backgroundColor: P.bg }}>
      <LockedLessonToast show={showLockedToast} onDismiss={() => setShowLockedToast(false)} />

        {/* ── Main content area ── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 shrink-0 overflow-x-hidden" style={{ backgroundColor: P.surface, borderBottom: `1px solid ${P.border}` }}>
            {selectedClass && (
              <button onClick={handleGoBack} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: P.muted }}>
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-sm font-black truncate flex-1 min-w-0" style={{ color: P.text }}>
              {selectedClass ? lessonClasses.find((c) => c.id === selectedClass)?.title || "" : "শিক্ষানবিস"}
            </h1>
            {/* Reading size presets */}
            <div className="hidden lg:flex items-center mr-1 gap-0.5 rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {READING_PRESETS.map((p) => (
                <button key={p.label} onClick={() => handleReadingSize(p.value)}
                  className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all"
                  style={{
                    color: readingSize === p.value ? P.bg : P.muted,
                    backgroundColor: readingSize === p.value ? P.accent : "transparent",
                  }} title={p.name}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Notes toggle */}
            {selectedClass && (
              <button
                onClick={() => setNotesPanelOpen(!notesPanelOpen)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: notesPanelOpen ? P.bg : P.muted,
                  backgroundColor: notesPanelOpen ? P.accent : 'transparent',
                }}
              >
                  <FileText size={14} /> আমার নোট
              </button>
            )}
            {/* Audio Learning cluster — inline in the top toolbar on desktop,
                sticky bottom player on mobile (large touch targets, no h-scroll). */}
            <div
              className="flex flex-wrap items-center justify-center gap-1.5 fixed inset-x-0 bottom-0 left-0 right-0 z-40 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] border-t shadow-[0_-6px_20px_rgba(0,0,0,0.2)] md:static md:inset-auto md:z-auto md:flex-nowrap md:justify-start md:border-0               md:shadow-none md:px-0 md:py-0 md:flex-none audio-player-bar"
              style={{ backgroundColor: P.surface, borderColor: "rgba(255,255,255,0.1)" }}
            >
            {/* Audio Reading ON/OFF toggle */}
            <button
              onClick={() => setAudioEnabledWithPersist(!audioEnabled)}
              aria-pressed={audioEnabled}
              aria-label={audioEnabled ? "অডিও রিডিং বন্ধ করুন" : "অডিও রিডিং চালু করুন"}
              title="অডিও রিডিং চালু/বন্ধ"
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75] min-h-[44px] md:min-h-0"
              style={{
                borderColor: audioEnabled ? "rgba(29,158,117,0.4)" : "rgba(255,255,255,0.12)",
                backgroundColor: audioEnabled ? "rgba(29,158,117,0.12)" : "transparent",
                color: audioEnabled ? "var(--color-accent, #1D9E75)" : P.muted,
              }}
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span
                className="ml-1 inline-flex h-4 w-8 items-center rounded-full px-0.5 transition-colors"
                style={{ backgroundColor: audioEnabled ? "var(--color-accent, #1D9E75)" : "rgba(255,255,255,0.2)" }}
                aria-hidden="true"
              >
                <span
                  className="block h-3 w-3 rounded-full bg-white transition-transform"
                  style={{ transform: audioEnabled ? "translateX(16px)" : "translateX(0)" }}
                />
              </span>
            </button>

            {/* Play / Stop controls — only when reading a lesson and audio is ON */}
            {selectedClass && audioEnabled && tts.supported && (
              <div className="flex items-center gap-1 rounded-xl border px-1 py-0.5"
                style={{ borderColor: "rgba(29,158,117,0.2)", backgroundColor: "rgba(29,158,117,0.05)" }}>
                {!tts.isPlaying ? (
                  <button
                    onClick={tts.play}
                    aria-label="পাঠ শুনুন"
                    title="পাঠ শুনুন"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold min-h-[44px] md:min-h-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]"
                    style={{ backgroundColor: "rgba(29,158,117,0.08)", color: "var(--color-accent, #1D9E75)" }}
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
            <button
              onClick={handleExitCourse}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: P.muted }}
            >
                  <X size={14} /> কোর্স থেকে বের হন
            </button>
          </div>

          {/* ── Scrollable content ── */}
          <div ref={scrollRef} className="tts-selectable flex-1 overflow-y-auto overflow-x-hidden relative pb-44 md:pb-0"
            style={{ "--reading-scale": readingSize } as React.CSSProperties}>
            <ScrollContext.Provider value={scrollRef as any}>
            <AnimatePresence mode="wait">
              {!selectedClass ? (
                <motion.div
                  key="class-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 px-6"
                  style={{
                    minHeight: "100%",
                    background: `linear-gradient(135deg, ${P.bg}, ${P.surface}, ${P.surfaceAlt})`,
                  }}
                >
                  <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                      <div
                        className="inline-flex items-center gap-2 font-black rounded-full px-5 py-2 mb-4 uppercase tracking-widest"
                        style={{
                          fontSize: "13px",
                          background: `${P.accent}22`,
                          color: P.accent,
                          border: `1px solid ${P.border}`,
                        }}
                      >
                        <BookOpen size={14} /> শিক্ষানবিস
                      </div>
                      <h1 className="font-black mb-3 tracking-tight leading-tight" style={{ fontSize: "clamp(28px, 4vw, 36px)", color: P.text }}>
                        শুরুর যাত্রা — কম্পিউটার পরিচিতি
                      </h1>
                      <p className="font-medium leading-relaxed" style={{ fontSize: "16px", color: P.muted }}>
                        ১০টি ক্লাসে কম্পিউটার, সিপিইউ, র‍্যাম, স্টোরেজ, ইনপুট/আউটপুট ডিভাইস, সফটওয়্যার, অপারেটিং সিস্টেম, ইন্টারনেট ও সাইবার নিরাপত্তা।
                      </p>
                    </div>

                    {/* Class Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {lessonClasses.map((cls, idx) => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          index={idx}
                          onSelect={handleSelectClass}
                          isLocked={lessonStates[cls.id] === 'locked'}
                          isCompleted={lessonStates[cls.id] === 'completed'}
                          onLockedClick={() => setShowLockedToast(true)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedClass}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {/* Render the class content using the original ClassPageLayout/sections */}
                  <ClassContentRenderer classId={selectedClass} />
                </motion.div>
              )}
            </AnimatePresence>
            </ScrollContext.Provider>
          </div>

          {/* Floating "Read" toolbar for selected text */}
          {selectedText.toolbar.visible && (
            <div
              className="fixed z-[60] flex items-center gap-1 rounded-xl border px-1.5 py-1 shadow-lg max-w-[92vw]"
              style={{
                left: selectedText.toolbar.x,
                top: selectedText.toolbar.y,
                transform: "translateX(-50%)",
                backgroundColor: "var(--color-surface, #fff)",
                borderColor: "rgba(29,158,117,0.3)",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <button
                onClick={selectedText.readSelection}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all min-h-[40px]"
                style={{ backgroundColor: "rgba(29,158,117,0.12)", color: "var(--color-accent, #1D9E75)" }}
                title="নির্বাচিত অংশ শুনুন"
                aria-label="নির্বাচিত অংশ শুনুন"
              >
                <Volume2 size={13} />
                <span>শুনুন</span>
              </button>
              <button
                onClick={selectedText.hide}
                className="rounded-lg p-1 text-slate-400 transition-all hover:bg-black/5"
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
                backgroundColor: "var(--color-surface, #fff)",
                borderColor: "rgba(29,158,117,0.3)",
                color: "var(--color-accent, #1D9E75)",
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
              backgroundColor: P.bg,
              borderLeft: `1px solid ${P.border}`,
              boxShadow: notesPanelOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${P.border}` }}>
              <div className="flex items-center gap-2">
                <Edit3 size={15} style={{ color: P.accent }} />
                <span className="font-black text-sm" style={{ color: P.text }}>আমার নোট</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ backgroundColor: `${P.accent}18`, color: P.accent }}>
                  {Object.keys(notesMap).length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Object.keys(notesMap).length > 0 && (
                  <button onClick={handleExportNotes}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: P.muted }} title="সকল নোট .txt হিসেবে এক্সপোর্ট করুন">
                    <Download size={14} />
                  </button>
                )}
                <button onClick={() => setNotesPanelOpen(false)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: P.muted }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: `${P.accent}08`, border: `1px solid ${P.border}` }}>
                <Search size={13} style={{ color: P.muted }} />
                <input
                  type="text"                 placeholder="নোট খুঁজুন..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-xs font-medium" style={{ color: P.text }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ color: P.muted }}><X size={12} /></button>
                )}
              </div>
            </div>

            {searchQuery ? (
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8" style={{ color: P.muted, opacity: 0.5 }}>
                    <Search size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-semibold">কোন মিল পাওয়া যায়নি</p>
                  </div>
                ) : searchResults.map(result => (
                  <div key={result.lessonId}
                    className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: `${P.accent}08`, border: `1px solid ${P.border}` }}
                    onClick={() => {
                      setSearchQuery('')
                      const found = lessonClasses.find(c => c.id === result.lessonId)
                      if (found) handleSelectClass(found.id)
                    }}
                  >
                    <p className="text-[11px] font-black mb-1" style={{ color: P.accent }}>{result.lessonTitle}</p>
                    <p className="text-xs line-clamp-3 font-medium" style={{ color: P.muted }}>{result.content}</p>
                    <p className="text-[10px] mt-2 font-bold" style={{ color: `${P.accent}66` }}>
                      {new Date(result.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-3 pt-3 pb-2 shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${P.accent}66` }}>
                    বর্তমান পাঠ
                  </p>
                  <p className="text-xs font-bold truncate" style={{ color: P.accent }}>
                    {lesson?.title || '—'}
                  </p>
                </div>

                <div className="flex-1 px-3 pb-2 min-h-0">
                  <textarea
                    value={currentNoteText}
                    onChange={e => handleNoteChange(e.target.value)}
                    placeholder="এখানে নোট লিখুন... (Auto-save চালু আছে)"
                    className="w-full h-full resize-none outline-none rounded-xl p-3 text-sm leading-relaxed font-medium"
                    style={{
                      backgroundColor: `${P.accent}06`,
                      border: `1px solid ${P.border}`,
                      color: P.text,
                      fontFamily: "'Hind Siliguri', sans-serif",
                      minHeight: '180px',
                    }}
                  />
                </div>

                <div className="px-3 py-2 shrink-0 flex items-center justify-between gap-2 flex-wrap"
                  style={{ borderTop: `1px solid ${P.border}` }}>
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveNote}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ color: P.accent, backgroundColor: `${P.accent}18` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${P.accent}30` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${P.accent}18` }}
                    >
                      নোট সংরক্ষণ করুন
                    </button>
                    <span className="text-[10px] font-bold"
                      style={{ color: saveStatus === 'saved' ? P.accent : saveStatus === 'saving' ? '#f5c842' : 'transparent' }}>
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
                  <div className="px-3 pb-3 shrink-0 overflow-y-auto" style={{ maxHeight: '200px', borderTop: `1px solid ${P.border}` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest pt-3 pb-2" style={{ color: `${P.accent}66` }}>
                      সকল নোট ({Object.keys(notesMap).length})
                    </p>
                    <div className="space-y-2">
                      {Object.entries(notesMap).map(([lId, note]) => {
                        const l = lessonClasses.find(c => c.id === lId)
                        const isThisLesson = lId === currentMockId
                        return (
                          <div key={lId} onClick={() => { if (l) handleSelectClass(l.id) }}
                            className="p-2.5 rounded-lg cursor-pointer transition-all"
                            style={{
                              backgroundColor: isThisLesson ? `${P.accent}18` : `${P.accent}06`,
                              border: `1px solid ${isThisLesson ? `${P.accent}33` : P.border}`,
                            }}>
                            <p className="text-[10px] font-black mb-0.5 truncate" style={{ color: isThisLesson ? P.accent : P.muted }}>
                              {l?.title || 'অজানা'}
                            </p>
                            <p className="text-[10px] line-clamp-2 font-medium" style={{ color: P.muted }}>
                              {note.content}
                            </p>
                            <p className="text-[9px] mt-1 font-bold" style={{ color: `${P.accent}4D` }}>
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
        </main>
      </div>
    </PendingCompletionContext.Provider>
  );
}

// ── Renders the 6 section components with hero/nav for a given class ──
function ClassContentRenderer({ classId }: { classId: string }) {
  const P = useP();
  const Component = classComponents[classId];
  if (!Component) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: P.muted }}>
        <p>ক্লাসটি পাওয়া যায়নি</p>
      </div>
    );
  }
  return <Component />;
}
