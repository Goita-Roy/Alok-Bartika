import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronRight,
  Lock, CheckCircle2,
} from "lucide-react";
import { NotesPanel, type ThemeColors } from "../../components/lesson/NotesPanel";
import { LessonHeader } from "../../components/lesson/LessonHeader";
import { LessonSizeControl, readingSizeToOption, optionToReadingSize } from "../../components/lesson/LessonSizeControl";
import { lessonClasses } from "../../components/beginner-content/lessonConfig";
import { classComponents } from "./BeginnerClassPage";
import ScrollContext from "../../components/beginner-content/ScrollContext";
import { useCopyProtection } from "../../hooks/useCopyProtection";
import { useSpeechReader } from "../../hooks/useSpeechReader";
import { useSelectedTextReader } from "../../hooks/useSelectedTextReader";
import { useClickToRead } from "../../hooks/useClickToRead";
import { Volume2, Play, X } from "lucide-react";
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
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'light' ? {
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

const WELCOME_STORAGE_KEY = 'alokbartika_beginner_welcome_seen'

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
          <LessonHeader
            title={selectedClass ? lessonClasses.find((c) => c.id === selectedClass)?.title || "" : "শিক্ষানবিস"}
            showBackButton={Boolean(selectedClass)}
            onBack={handleGoBack}
            notesPanelOpen={notesPanelOpen}
            onToggleNotes={() => setNotesPanelOpen(!notesPanelOpen)}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabledWithPersist(!audioEnabled)}
            tts={{ ...tts, supported: Boolean(selectedClass) && tts.supported }}
            exitTo="/courses?level=beginner"
            onExit={handleExitCourse}
            sizeSelector={
              <LessonSizeControl
                value={readingSizeToOption(readingSize)}
                onChange={(opt) => handleReadingSize(optionToReadingSize(opt))}
              />
            }
          />

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
          <NotesPanel
            open={notesPanelOpen}
            onClose={() => setNotesPanelOpen(false)}
            storageKey="alokbartika_beginner_notes_v1"
            theme={P as ThemeColors}
            lessons={lessonClasses.map(c => ({ mockId: c.id, label: c.id, title: c.title }))}
            currentMockId={currentMockId}
            onNavigateToLesson={(meta) => handleSelectClass(meta.mockId)}
          />
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
