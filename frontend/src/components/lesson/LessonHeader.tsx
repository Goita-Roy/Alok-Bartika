import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, X, FileText,
  Play, Square, Volume2, VolumeX,
} from "lucide-react";

// ── Shared lesson header toolbar ──────────────────────────────────────────
// Identical across Beginner, Intermediate and Advanced. Each level passes
// its own props; the layout, spacing, colors, icons and responsive behavior
// are pixel-identical.

const S = {
  surface: "#0A4A3F",
  bg: "#04342C",
  accent: "#65D1B2",
  light: "#8FE3CC",
  text: "#F5F7F6",
  muted: "#B8C5C1",
};

interface TTSControls {
  isPlaying: boolean;
  isPaused: boolean;
  supported: boolean;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

interface LessonHeaderProps {
  /** Lesson title displayed in the header */
  title: string;

  /** Whether to show the back-arrow button */
  showBackButton?: boolean;
  /** Called when the back arrow is clicked */
  onBack?: () => void;

  /** Whether the notes panel is currently open */
  notesPanelOpen: boolean;
  /** Toggle the notes panel */
  onToggleNotes: () => void;

  /** Whether audio reading is enabled */
  audioEnabled: boolean;
  /** Toggle audio on/off */
  onToggleAudio: () => void;

  /** TTS reader controls */
  tts: TTSControls;

  /** Route to navigate to when "কোর্স থেকে বের হন" is clicked */
  exitTo: string;
  /** Optional async exit handler (e.g. for pending completion). Overrides Link navigation. */
  onExit?: () => void;

  /** Level-specific size control rendered in the header (ছোট/মাঝারি/বড়) */
  sizeSelector?: ReactNode;
}

export function LessonHeader({
  title,
  showBackButton = false,
  onBack,
  notesPanelOpen,
  onToggleNotes,
  audioEnabled,
  onToggleAudio,
  tts,
  exitTo,
  onExit,
  sizeSelector,
}: LessonHeaderProps) {
  return (
    <div
      className="px-4 py-3 shrink-0"
      style={{
        backgroundColor: S.surface,
        borderBottom: "1px solid rgba(101,209,178,0.12)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* ── Back button (optional) ── */}
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0"
            style={{ color: S.muted }}
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* ── Title ── */}
        <h1
          className="text-sm font-black truncate flex-1 min-w-0"
          style={{ color: S.text }}
        >
          {title}
        </h1>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Size selector slot */}
          {sizeSelector}

          {/* Notes toggle */}
          <button
            onClick={onToggleNotes}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              color: notesPanelOpen ? "#04342C" : S.muted,
              backgroundColor: notesPanelOpen ? S.accent : "transparent",
            }}
          >
            <FileText size={14} /> আমার নোট
          </button>

          {/* Audio Learning cluster — sticky bottom on mobile, inline on desktop */}
          <div
            className="flex flex-wrap items-center justify-center gap-1.5 fixed inset-x-0 bottom-0 left-0 right-0 z-40 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] border-t shadow-[0_-6px_20px_rgba(0,0,0,0.2)] md:static md:inset-auto md:z-auto md:flex-nowrap md:justify-start md:border-0 md:shadow-none md:px-0 md:py-0 md:flex-none audio-player-bar"
            style={{
              backgroundColor: S.surface,
              borderColor: "rgba(101,209,178,0.12)",
            }}
          >
            {/* Audio Reading ON/OFF toggle */}
            <button
              onClick={onToggleAudio}
              aria-pressed={audioEnabled}
              aria-label={
                audioEnabled
                  ? "অডিও রিডিং বন্ধ করুন"
                  : "অডিও রিডিং চালু করুন"
              }
              title="অডিও রিডিং চালু/বন্ধ"
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D1B2] min-h-[44px] md:min-h-0"
              style={{
                borderColor: audioEnabled
                  ? "rgba(101,209,178,0.4)"
                  : "rgba(255,255,255,0.12)",
                backgroundColor: audioEnabled
                  ? "rgba(101,209,178,0.12)"
                  : "transparent",
                color: audioEnabled ? S.accent : S.muted,
              }}
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span
                className="ml-1 inline-flex h-4 w-8 items-center rounded-full px-0.5 transition-colors"
                style={{
                  backgroundColor: audioEnabled
                    ? S.accent
                    : "rgba(255,255,255,0.2)",
                }}
                aria-hidden="true"
              >
                <span
                  className="block h-3 w-3 rounded-full bg-white transition-transform"
                  style={{
                    transform: audioEnabled
                      ? "translateX(16px)"
                      : "translateX(0)",
                  }}
                />
              </span>
            </button>

            {/* Play / Stop controls */}
            {audioEnabled && tts.supported && (
              <div
                className="flex items-center gap-1 rounded-xl border px-1 py-0.5"
                style={{
                  borderColor: "rgba(101,209,178,0.2)",
                  backgroundColor: "rgba(101,209,178,0.05)",
                }}
              >
                {!tts.isPlaying ? (
                  <button
                    onClick={tts.play}
                    aria-label="পাঠ শুনুন"
                    title="পাঠ শুনুন"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold min-h-[44px] md:min-h-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65D1B2]"
                    style={{
                      backgroundColor: "rgba(101,209,178,0.08)",
                      color: S.accent,
                    }}
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

          {/* Exit button */}
          {onExit ? (
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0"
              style={{ color: S.muted }}
            >
              <X size={14} /> কোর্স থেকে বের হন
            </button>
          ) : (
            <Link
              to={exitTo}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 shrink-0"
              style={{ color: S.muted }}
            >
              <X size={14} /> কোর্স থেকে বের হন
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
