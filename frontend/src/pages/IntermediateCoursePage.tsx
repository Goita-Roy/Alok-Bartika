import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LessonCompleteToast } from '../components/lesson/LessonCompleteToast';
import { LockedLessonToast } from '../components/lesson/LockedLessonToast';
import { IntermediateFontSizeControl, useIntermediateLessonSize } from '../components/lesson/IntermediateFontSizeControl';
import { useLessonReadingProgress } from '../hooks/useLessonReadingProgress';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
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
import { Button } from '../components/intermediate/ui/Button';
import { VisualLearning } from '../components/intermediate/challenges/VisualLearning';
import { DefinitionSection } from '../components/intermediate/challenges/DefinitionSection';
import { Challenge } from '../components/intermediate/challenges/Challenge';
import { DecisionStory } from '../components/intermediate/challenges/DecisionStory';
import { CauseEffectStory } from '../components/intermediate/challenges/CauseEffectStory';
import { RepeatActionStory } from '../components/intermediate/challenges/RepeatActionStory';
import { ScoreboardStory } from '../components/intermediate/challenges/ScoreboardStory';
import { IfElseDecisionStory } from '../components/intermediate/challenges/IfElseDecisionStory';
import { OperatorStory } from '../components/intermediate/challenges/OperatorStory';
import { SensingStory } from '../components/intermediate/challenges/SensingStory';
import { BackgroundSoundStory } from '../components/intermediate/challenges/BackgroundSoundStory';
import { LogicChallenge } from '../components/intermediate/challenges/LogicChallenge';
import { LoopsChallenge } from '../components/intermediate/challenges/LoopsChallenge';
import { VariablesChallenge } from '../components/intermediate/challenges/VariablesChallenge';
import { IfElseChallenge } from '../components/intermediate/challenges/IfElseChallenge';
import { OperatorChallenge } from '../components/intermediate/challenges/OperatorChallenge';
import { SensingChallenge } from '../components/intermediate/challenges/SensingChallenge';
import { BackgroundSoundChallenge } from '../components/intermediate/challenges/BackgroundSoundChallenge';
import { FlowchartGame } from '../components/intermediate/games/FlowchartGame';
import { EventTriggerGame } from '../components/intermediate/games/EventTriggerGame';
import { LogicArchitectGame } from '../components/intermediate/games/LogicArchitectGame';
import { LoopRunnerGame } from '../components/intermediate/games/LoopRunnerGame';
import { OperatorMasterGame } from '../components/intermediate/games/OperatorMasterGame';
import { VariableKeeperGame } from '../components/intermediate/games/VariableKeeperGame';
import { SensingMasterGame } from '../components/intermediate/games/SensingMasterGame';
import { SceneDirectorGame } from '../components/intermediate/games/SceneDirectorGame';
import { PasswordDefenderGame } from '../components/intermediate/games/PasswordDefenderGame';
import { LogicScaffold } from '../components/intermediate/scaffold/LogicScaffold';
import { LoopsScaffold } from '../components/intermediate/scaffold/LoopsScaffold';
import { VariablesScaffold } from '../components/intermediate/scaffold/VariablesScaffold';
import { IfElseScaffold } from '../components/intermediate/scaffold/IfElseScaffold';
import { OperatorsScaffold } from '../components/intermediate/scaffold/OperatorsScaffold';
import { SensingScaffold } from '../components/intermediate/scaffold/SensingScaffold';
import { BackgroundSoundScaffold } from '../components/intermediate/scaffold/BackgroundSoundScaffold';
import {
  lessonData,
  flowchartData,
  eventsData,
  programmingLogicData,
  loopsData,
  variablesData,
  ifElseData,
  operatorsData,
  sensingData,
  soundBackgroundData,
  type LessonData,
} from '../data/intermediateLessonData';
import { useCourseProgress } from '../hooks/useCourseProgress'
import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'
import {
  BookOpen, CheckCircle2, Lock, ChevronRight, ChevronLeft, X, PanelLeftClose, PanelLeft,
  ArrowLeft, ArrowRight, Clock, AlertCircle, Trophy, Volume2, Play,
} from 'lucide-react';
import { NotesPanel } from '../components/lesson/NotesPanel';
import { LessonHeader } from '../components/lesson/LessonHeader';

type LessonId =
  | 'algorithm'
  | 'flowchart'
  | 'events'
  | 'logic'
  | 'loops'
  | 'variables'
  | 'ifelse'
  | 'operators'
  | 'sensing'
  | 'sound';

const ILLUSTRATION_MAP: Record<LessonId, 'computer' | 'flowchart' | 'events' | 'logic' | 'loops' | 'variables' | 'ifelse'> = {
  algorithm: 'computer',
  flowchart: 'flowchart',
  events: 'events',
  logic: 'logic',
  loops: 'loops',
  variables: 'variables',
  ifelse: 'ifelse',
  operators: 'computer',
  sensing: 'computer',
  sound: 'computer',
};

interface LessonConfig {
  id: LessonId;
  label: string;
  title: string;
  duration: string;
  data: LessonData;
  StoryComponent?: React.ComponentType<any>;
  ChallengeComponent?: React.ComponentType<any>;
  GameComponent?: React.ComponentType<any>;
  ScaffoldComponent?: React.ComponentType<any>;
}

const LESSONS: LessonConfig[] = [
  {
    id: 'algorithm',
    label: 'Class 01',
    title: 'Algorithm (অ্যালগরিদম)',
    duration: '45 min',
    data: lessonData,
    StoryComponent: DecisionStory,
    GameComponent: undefined,
    ScaffoldComponent: undefined,
  },
  {
    id: 'flowchart',
    label: 'Class 02',
    title: 'Flowchart (ফ্লোচার্ট)',
    duration: '45 min',
    data: flowchartData,
    ChallengeComponent: undefined,
    GameComponent: FlowchartGame,
    ScaffoldComponent: undefined,
  },
  {
    id: 'events',
    label: 'Class 03',
    title: 'Events (ইভেন্ট)',
    duration: '45 min',
    data: eventsData,
    StoryComponent: CauseEffectStory,
    GameComponent: EventTriggerGame,
    ScaffoldComponent: undefined,
  },
  {
    id: 'logic',
    label: 'Class 04',
    title: 'Programming Logic (প্রোগ্রামিং লজিক)',
    duration: '45 min',
    data: programmingLogicData,
    StoryComponent: RepeatActionStory,
    ChallengeComponent: LogicChallenge,
    GameComponent: LogicArchitectGame,
    ScaffoldComponent: LogicScaffold,
  },
  {
    id: 'loops',
    label: 'Class 05',
    title: 'Loops (লুপ)',
    duration: '45 min',
    data: loopsData,
    StoryComponent: ScoreboardStory,
    ChallengeComponent: LoopsChallenge,
    GameComponent: LoopRunnerGame,
    ScaffoldComponent: LoopsScaffold,
  },
  {
    id: 'variables',
    label: 'Class 06',
    title: 'Variables (ভেরিয়েবল)',
    duration: '45 min',
    data: variablesData,
    StoryComponent: undefined,
    ChallengeComponent: VariablesChallenge,
    GameComponent: VariableKeeperGame,
    ScaffoldComponent: VariablesScaffold,
  },
  {
    id: 'ifelse',
    label: 'Class 07',
    title: 'If-Else (ইফ-এলস)',
    duration: '45 min',
    data: ifElseData,
    StoryComponent: IfElseDecisionStory,
    ChallengeComponent: IfElseChallenge,
    GameComponent: SceneDirectorGame,
    ScaffoldComponent: IfElseScaffold,
  },
  {
    id: 'operators',
    label: 'Class 08',
    title: 'Operators (অপারেটর)',
    duration: '45 min',
    data: operatorsData,
    StoryComponent: OperatorStory,
    ChallengeComponent: OperatorChallenge,
    GameComponent: OperatorMasterGame,
    ScaffoldComponent: OperatorsScaffold,
  },
  {
    id: 'sensing',
    label: 'Class 09',
    title: 'Sensing (সেন্সিং)',
    duration: '45 min',
    data: sensingData,
    StoryComponent: SensingStory,
    ChallengeComponent: SensingChallenge,
    GameComponent: SensingMasterGame,
    ScaffoldComponent: SensingScaffold,
  },
  {
    id: 'sound',
    label: 'Class 10',
    title: 'Sound & Background (সাউন্ড ও ব্যাকগ্রাউন্ড)',
    duration: '45 min',
    data: soundBackgroundData,
    StoryComponent: BackgroundSoundStory,
    ChallengeComponent: BackgroundSoundChallenge,
    GameComponent: PasswordDefenderGame,
    ScaffoldComponent: BackgroundSoundScaffold,
  },
];

const LESSON_ID_TO_MOCK_ID: Record<LessonId, string> = {
  algorithm: 'intermediate-algorithm',
  flowchart: 'intermediate-flowchart',
  events: 'intermediate-events',
  logic: 'intermediate-logic',
  loops: 'intermediate-loops',
  variables: 'intermediate-variables',
  ifelse: 'intermediate-ifelse',
  operators: 'intermediate-operators',
  sensing: 'intermediate-sensing',
  sound: 'intermediate-sound',
};

const MOCK_ID_TO_LESSON_ID: Record<string, LessonId> = (
  Object.keys(LESSON_ID_TO_MOCK_ID) as LessonId[]
).reduce<Record<string, LessonId>>((acc, lessonId) => {
  acc[LESSON_ID_TO_MOCK_ID[lessonId]] = lessonId;
  return acc;
}, {});

const SIDEBAR_KEY = 'alokbartika_intermediate_sidebar_collapsed'
const S = {
  surface: '#0A4A3F', bg: '#04342C',
  accent: '#65D1B2', light: '#8FE3CC',
  text: '#F5F7F6', muted: '#B8C5C1',
}

// Display-only: convert English digits to Bengali digits for the progress bar.
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
function toBnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[Number(d)])
}

// ── LessonHero ────────────────────────────────────────────────────────
function LessonHero({
  lesson,
  onStart,
}: {
  lesson: LessonConfig;
  onStart: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-gray-900 dark:to-slate-900"
    >
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
          {lesson.label}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
          {lesson.title}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          {lesson.duration}
        </p>
        <Button onClick={onStart} variant="primary" size="lg">
          শেখা শুরু করুন
        </Button>
      </motion.div>
    </section>
  );
}

// ── LessonTransition (fade+slide on lesson change) ────────────────────
function LessonTransition({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [lessonId])
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  )
}

// ── Sidebar (matches Beginner page dark green theme) ──────────────────
function Sidebar({
  lessons, activeId, collapsed, onToggle, onSelect, onCloseMobile,
  lessonStates, onLockedClick,
}: {
  lessons: LessonConfig[]
  activeId: LessonId
  collapsed: boolean
  onToggle: () => void
  onSelect: (id: LessonId) => void
  onCloseMobile: () => void
  lessonStates: Record<string, 'locked' | 'unlocked' | 'completed'>
  onLockedClick: () => void
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeId])

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: S.surface, borderRight: '1px solid rgba(101,209,178,0.12)' }}
    >
      <div className="flex items-center justify-between p-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(101,209,178,0.12)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={16} style={{ color: S.accent }} />
            <h2 className="font-black text-sm truncate" style={{ color: S.text }} title="Intermediate Course">
              মধ্যবর্তী
            </h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5 hidden lg:flex items-center justify-center"
          style={{ color: S.muted }}
          title={collapsed ? 'সাইডবার খুলুন' : 'সাইডবার বন্ধ করুন'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <button
          onClick={onCloseMobile}
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5 lg:hidden flex items-center justify-center"
          style={{ color: S.muted }}
        >
          <X size={16} />
        </button>
      </div>

      {collapsed && (
        <div className="py-2 flex justify-center">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}>
            {lessons.length}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-1">
        {lessons.map((lesson, index) => {
          const mockId = LESSON_ID_TO_MOCK_ID[lesson.id]
          const isActive = lesson.id === activeId
          const state = lessonStates[mockId] || 'locked'
          const isLocked = state === 'locked'

          return (
            <button
              key={lesson.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => {
                if (isLocked) { onLockedClick(); return; }
                onSelect(lesson.id)
                if (onCloseMobile) onCloseMobile()
              }}
              className="w-full text-left flex items-center gap-3 transition-all duration-200"
              style={{
                padding: collapsed ? '12px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderLeft: `3px solid ${isActive ? S.accent : 'transparent'}`,
                backgroundColor: isActive ? 'rgba(101,209,178,0.08)' : 'transparent',
                opacity: isLocked ? 0.35 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!isActive && !isLocked) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(101,209,178,0.04)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {state === 'completed' ? (
                <span className="shrink-0 flex items-center justify-center"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    borderRadius: collapsed ? '50%' : '8px',
                    backgroundColor: 'rgba(101,209,178,0.15)',
                    color: S.accent,
                  }}>
                  <CheckCircle2 size={collapsed ? 16 : 14} />
                </span>
              ) : isLocked ? (
                <span className="shrink-0 flex items-center justify-center"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    borderRadius: collapsed ? '50%' : '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: S.muted,
                  }}>
                  <Lock size={collapsed ? 14 : 12} />
                </span>
              ) : (
                <span className="shrink-0 flex items-center justify-center text-xs font-black rounded-lg transition-all"
                  style={{
                    width: collapsed ? '32px' : '28px',
                    height: collapsed ? '32px' : '28px',
                    backgroundColor: isActive ? S.accent : 'rgba(101,209,178,0.10)',
                    color: isActive ? '#04342C' : S.muted,
                    borderRadius: collapsed ? '50%' : '8px',
                  }}>
                  {index + 1}
                </span>
              )}
              {!collapsed && (
                <span className="text-sm font-semibold truncate" style={{ color: isActive ? S.accent : S.muted }}>
                  {lesson.label}: {lesson.title}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export function IntermediateCoursePage() {
  useCopyProtection();
  const [searchParams] = useSearchParams()
  const hasLessonParam = Boolean(searchParams.get('lesson'))
  const initialLesson: LessonId = (() => {
    const raw = searchParams.get('lesson')
    if (raw) {
      const asOrder = Number(raw)
      if (!Number.isNaN(asOrder) && asOrder >= 1 && asOrder <= LESSONS.length) {
        const slug = LESSONS[asOrder - 1]?.id
        if (slug) return slug
      }
      if (raw in LESSON_ID_TO_MOCK_ID) return raw as LessonId
      if (raw in MOCK_ID_TO_LESSON_ID) return MOCK_ID_TO_LESSON_ID[raw]
    }
    return 'algorithm'
  })()
  const [currentLesson, setCurrentLesson] = useState<LessonId>(initialLesson);

  // Resume from the canonical Continue Learning lesson when the student opens
  // the course without an explicit ?lesson= param. Source of truth = MongoDB
  const resumedRef = useRef(false)

  // Persist the current lesson so Continue Learning resumes to the exact lesson
  // across refresh / logout / different device. Stored in MongoDB only.
  useEffect(() => {
    const mockId = LESSON_ID_TO_MOCK_ID[currentLesson]
    if (mockId) {
      saveLastVisited(mockId, intermCourse?._id, 'intermediate')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson])

  const [started, setStarted] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true' } catch { return false }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notesPanelOpen, setNotesPanelOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // ── Scroll container ref (used by TTS, selected-text reader, and scroll tracking) ──
  const contentScrollRef = useRef<HTMLDivElement>(null);

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

  // ── Reading size (Small / Medium / Large) ────────────────────────
  // Single, clean implementation for the Intermediate lesson container.
  const intermediateLessonSize = useIntermediateLessonSize()

  const saveSidebar = useCallback((val: boolean) => {
    setSidebarCollapsed(val)
    try { localStorage.setItem(SIDEBAR_KEY, String(val)) } catch {}
  }, [])

  // ── Scroll & engagement tracking ─────────────────────────────────
  const [scrollProgress, setScrollProgress] = useState(0)
  const [engagementTime, setEngagementTime] = useState(0)
  const [contentViewed, setContentViewed] = useState(false)
  const hasScrolled = useRef(false)
  const hasUserScrolled = useRef(false)

  useEffect(() => {
    const el = contentScrollRef.current
    if (!el) return
    const onUserScroll = () => { hasUserScrolled.current = true }
    el.addEventListener('scroll', onUserScroll, { passive: true })
    return () => el.removeEventListener('scroll', onUserScroll)
  }, [])

  const readingProgress = useLessonReadingProgress(
    LESSON_ID_TO_MOCK_ID[currentLesson],
    contentScrollRef,
  )

  useEffect(() => {
    const el = contentScrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const maxScroll = scrollHeight - clientHeight
      if (maxScroll <= 0) {
        if (hasUserScrolled.current) {
          setScrollProgress(100)
          if (!hasScrolled.current) { hasScrolled.current = true; setContentViewed(true) }
        }
      } else {
        setScrollProgress(Math.min(100, Math.round((scrollTop / maxScroll) * 100)))
        if (scrollTop > 10 && !hasScrolled.current) {
          hasScrolled.current = true; setContentViewed(true)
        }
      }
    }
    el.addEventListener('scroll', update, { passive: true })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  useEffect(() => {
    setScrollProgress(0)
    setEngagementTime(0)
    setContentViewed(false)
    hasScrolled.current = false
    hasUserScrolled.current = false
    const interval = setInterval(() => setEngagementTime(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [currentLesson])

  const canComplete = scrollProgress >= 80 && engagementTime >= 30 && contentViewed && hasUserScrolled.current

  // ── Progress tracking ─────────────────────────────────────────────
  const lessonIds = useMemo(() => LESSONS.map(l => LESSON_ID_TO_MOCK_ID[l.id]), [])
  const classesByLevel = useMemo(() => ({
    beginner: [],
    intermediate: LESSONS.map(l => ({ id: LESSON_ID_TO_MOCK_ID[l.id] })),
    advanced: [],
  }), [])

  // Reconcile MongoDB _id <-> mock id exactly like the Course List does, so a
  // lesson completed on any page (and stored under either id form) is recognised.
  const { data: intermCoursesData } = useQuery({
    queryKey: ['interm-progress-courses'],
    queryFn: async () => (await fetch(`${API_BASE_URL}/courses`)).json(),
  })
  const intermCourse = intermCoursesData?.data?.find((c: any) => c.level === 'intermediate')
  const { data: intermLessonsData } = useQuery({
    queryKey: ['interm-progress-lessons', intermCourse?._id],
    enabled: !!intermCourse?._id,
    queryFn: async () => (await fetch(`${API_BASE_URL}/courses/${intermCourse!._id}`)).json(),
  })

  const {
    completedClassIds, isLessonUnlocked, markClassComplete, completeLevel, getLevelProgress, continueLearning, saveLastVisited, apiLoaded, completedLevels,
  } = useCourseProgress(classesByLevel, lessonIds)

  // Resume the learner into their in-progress lesson when they open
  // the course without an explicit ?lesson= param. Source of truth = MongoDB
  // (via continueLearning from the progression API). Runs once on load.
  useEffect(() => {
    if (resumedRef.current || hasLessonParam) return
    if (continueLearning?.continueLevel !== 'intermediate') return
    const slug = continueLearning.continueLessonId
    if (slug && (slug in LESSON_ID_TO_MOCK_ID)) {
      setCurrentLesson(slug as LessonId)
      resumedRef.current = true
    }
  }, [continueLearning, hasLessonParam])

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

  // ── Dynamic progress (reuses the existing LMS completion system) ──
  // Total / completed / percentage are all derived from the SAME
  // useCourseProgress state that drives unlocks & the Final Exam. No new
  // storage or progress system is introduced.
  const intermediateTotalLessons = lessonIds.length
  const intermediateCompletedLessons = lessonIds.filter(id => completedClassIds.includes(id)).length
  const intermediateProgress = getLevelProgress('intermediate')

  const isIntermediateCompleted = getLevelProgress('intermediate') >= 100

  useEffect(() => {
    if (isIntermediateCompleted) {
      completeLevel('intermediate')
    }
  }, [isIntermediateCompleted, completeLevel])

  const lesson = LESSONS.find((l) => l.id === currentLesson)!;
  const mockId = LESSON_ID_TO_MOCK_ID[currentLesson]
  const currentMockId = mockId
  const isCurrentCompleted = completedClassIds.includes(mockId)

  const {
    StoryComponent,
    ChallengeComponent,
    GameComponent,
    ScaffoldComponent,
  } = lesson;
  const data = lesson.data;

  const sidebarWidth = sidebarCollapsed ? 60 : 288

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
    const contentArea = document.getElementById('intermediate-content-scroll')
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Complete lesson handler ───────────────────────────────────────
  const handleCompleteLesson = () => {
    if (isCurrentCompleted || completingId) return
    setCompletingId(currentMockId)
    markClassComplete(currentMockId, intermCourse?._id)

    setTimeout(() => {
      setCompletingId(null)
    }, 1200)
  }

  const [showCompleteToast, setShowCompleteToast] = useState(false)
  const [showLockedToast, setShowLockedToast] = useState(false)

  useEffect(() => {
    if (canComplete && !isCurrentCompleted) {
      handleCompleteLesson()
      setShowCompleteToast(true)
    }
  }, [canComplete, isCurrentCompleted])

  return (
    <div style={{ backgroundColor: S.bg }}>
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
          <LessonHeader
            title={lesson.title}
            showBackButton={Boolean(started)}
            onBack={() => setStarted(false)}
            notesPanelOpen={notesPanelOpen}
            onToggleNotes={() => setNotesPanelOpen(!notesPanelOpen)}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabledWithPersist(!audioEnabled)}
            tts={tts}
            exitTo="/courses?level=intermediate"
            sizeSelector={<IntermediateFontSizeControl />}
          />

          {/* ── Scrollable content ── */}
          <div ref={contentScrollRef} id="intermediate-content-scroll" className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* ── Intermediate Progress Bar (dynamic, LMS-driven) ──
                Reflects completed lessons/classes from useCourseProgress. Updates
                instantly on completion and restores after refresh via the existing
                localStorage + MongoDB sync. UI only — no logic changed. */}
            <div
              className="w-full px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: S.surface, borderBottom: '1px solid rgba(101,209,178,0.12)' }}
            >
              <span
                className="text-xs font-black uppercase tracking-wider shrink-0"
                style={{ color: S.muted, fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                অগ্রগতি
              </span>
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(101,209,178,0.10)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${intermediateProgress}%`, background: 'linear-gradient(90deg, #0E7C66, #65D1B2)' }}
                />
              </div>
              <span
                className="text-xs font-bold shrink-0"
                style={{ color: S.muted, fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                সম্পন্ন পাঠ {toBnDigits(intermediateCompletedLessons)}/{toBnDigits(intermediateTotalLessons)}
              </span>
              <span
                className="text-xs font-black tabular-nums w-12 text-right shrink-0"
                style={{ color: S.accent, fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {toBnDigits(intermediateProgress)}%
              </span>
            </div>
            <div className="flex justify-center">
              <div
                className={`flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-8 space-y-6 intermediate-lesson-size-${intermediateLessonSize}`}
                style={{ maxWidth: 'none', transition: 'all 200ms' }}
              >
                {!started ? (
                  <LessonHero lesson={lesson} onStart={() => setStarted(true)} />
                ) : (
                  <>
                    <LessonTransition lessonId={currentLesson}>
                      {ChallengeComponent ? (
                        <ChallengeComponent />
                      ) : data.challenge ? (
                        <Challenge
                          title={data.challenge.title}
                          task={data.challenge.task}
                          steps={data.challenge.steps}
                        />
                      ) : null}

                      {StoryComponent ? (
                        <StoryComponent storySteps={data.storySteps} storyQuestion={data.storyQuestion} />
                      ) : null}

                      {data.definition?.term && (
                        <DefinitionSection
                          term={data.definition.term}
                          fullText={data.definition.fullText || ''}
                          highlights={data.definition.highlights}
                          illustration={ILLUSTRATION_MAP[currentLesson]}
                        />
                      )}

                      {(data.visualSteps || data.recipeComparison) && (
                        <VisualLearning
                          visualSteps={data.visualSteps}
                          recipeComparison={data.recipeComparison}
                        />
                      )}

                      {ScaffoldComponent && <ScaffoldComponent />}

                      {GameComponent && <GameComponent />}

                      {!ChallengeComponent && !StoryComponent && !data.definition?.term && !data.visualSteps && !data.recipeComparison && !ScaffoldComponent && !GameComponent && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <AlertCircle size={28} style={{ color: S.muted, opacity: 0.5 }} />
                          <p className="text-sm font-bold mt-4" style={{ color: S.muted }}>এই ক্লাসের কন্টেন্ট শীঘ্রই আসছে।</p>
                          <p className="text-xs mt-1" style={{ color: S.muted, opacity: 0.5 }}>পরবর্তীতে আবার দেখুন।</p>
                        </div>
                      )}
                    </LessonTransition>

                    {/* ── Beginner-style Previous / Next ── */}
                    <div className="flex items-stretch justify-between gap-3 pb-8 pt-4">
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

                      {/* Next / Final Exam */}
                      {isLastLesson ? (
                        completedLevels?.includes('intermediate') ? (
                          <Link
                            to="/exam-review/intermediate"
                            className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: `1px solid ${S.accent}` }}
                          >
                            <span>✅ পরীক্ষায় পাস করেছে</span>
                            <span className="text-xs underline">পর্যালোচনা</span>
                          </Link>
                        ) : isIntermediateCompleted ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                            style={{ backgroundColor: S.accent, color: '#04342C', border: `1px solid ${S.accent}` }}
                          >
                            <Link to="/exam/intermediate" className="flex items-center gap-2 text-left">
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
          <NotesPanel
            open={notesPanelOpen}
            onClose={() => setNotesPanelOpen(false)}
            storageKey="alokbartika_intermediate_notes_v1"
            theme={{ ...S, border: 'rgba(101,209,178,0.12)' }}
            lessons={LESSONS.map(l => ({ mockId: LESSON_ID_TO_MOCK_ID[l.id], label: l.label, title: l.title }))}
            currentMockId={currentMockId}
            onNavigateToLesson={(meta) => navigateToLesson(meta.mockId as LessonId)}
          />
      </div>
    </div>
  )
}
