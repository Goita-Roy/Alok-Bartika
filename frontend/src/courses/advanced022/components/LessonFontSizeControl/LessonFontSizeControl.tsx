import { useEffect, useState } from "react";

export type LessonSize = "small" | "medium" | "large";

export const LESSON_SIZE_STORAGE_KEY = "advanced022_lesson_size";
export const LESSON_SIZE_CHANGE_EVENT = "advanced022:lesson-size-change";

const LESSON_SIZE_OPTIONS: { value: LessonSize; label: string }[] = [
  { value: "small", label: "ছোট" },
  { value: "medium", label: "মাঝারি" },
  { value: "large", label: "বড়" },
];

// ── Container-based sizing ────────────────────────────────────────────────
// The lesson wrapper (in LessonPage) gets a `lesson-size-*` class. To scale the
// ENTIRE white lesson container (typography + spacing + padding + margins +
// widths + cards + code blocks + images) — without CSS/browser zoom and without
// transform — we:
//   1) set a base font-size on the wrapper, and
//   2) re-express the Tailwind utilities used inside the lesson in `em` units so
//      every child inherits the sizing automatically off that base.
// Medium emits NO overrides (identical to the current design). Everything is
// scoped to `.lesson-size-*`, so the toolbar, header, Speak/Notes/Exit buttons,
// progress bar, sidebar, dashboard, course cards, navigation and global layout
// (all outside the wrapper) are never touched. Responsive `sm/md/lg` variants
// are mirrored so behavior is preserved on desktop, tablet and mobile.
const SCALE: Record<LessonSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.15,
};
const BASE_FONT_PX = 16;

const STYLE_ELEMENT_ID = "advanced022-lesson-size-style";

// Tailwind default font-size scale (rem at 16px root).
const TEXT_REM: Record<string, number> = {
  xs: 0.75,
  sm: 0.875,
  base: 1,
  lg: 1.125,
  xl: 1.25,
  "2xl": 1.5,
  "3xl": 1.875,
  "4xl": 2.25,
  "5xl": 3,
};
// Arbitrary px font-sizes used in the lesson content (text-[10px], ...).
const TEXT_ARBITRARY_PX = [8, 9, 10, 11, 15];
// Tailwind line-height keywords mapped to a rem-ish em base.
const LEADING: Record<string, string> = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
  "6": "1.5rem",
};
// Tailwind border-radius scale (rem).
const ROUNDED: Record<string, number> = {
  sm: 0.125,
  "": 0.25,
  md: 0.375,
  lg: 0.5,
  xl: 0.75,
  "2xl": 1,
  "3xl": 1.5,
};
// Tailwind numeric spacing steps used across lesson content (step * 0.25rem).
const SPACING_STEPS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20,
  24, 28, 32, 36, 40, 48, 60, 64, 72,
];
// Named max-width steps used in the lesson content (rem).
const MAX_W: Record<string, number> = {
  xs: 20,
  "2xl": 42,
  "3xl": 48,
  "5xl": 64,
  "6xl": 72,
};

const cssEscapeStep = (step: number) => String(step).replace(".", "\\.");

function buildLessonSizeCss(size: LessonSize): string {
  if (size === "medium") return ""; // current design, no visual changes

  const scale = SCALE[size];
  const scope = `.lesson-size-${size}`;
  const em = (rem: number) => `${(rem * scale).toFixed(4)}em`;
  const rules: string[] = [];

  // Base font-size drives em inheritance for the whole container.
  rules.push(`${scope} { font-size: ${(BASE_FONT_PX * scale).toFixed(4)}px; }`);

  // Typography
  for (const [name, rem] of Object.entries(TEXT_REM)) {
    rules.push(`${scope} .text-${name} { font-size: ${em(rem)}; }`);
  }
  for (const px of TEXT_ARBITRARY_PX) {
    rules.push(
      `${scope} .text-\\[${px}px\\] { font-size: ${((px / BASE_FONT_PX) * scale).toFixed(4)}em; }`,
    );
  }

  // Line-height
  for (const [name, val] of Object.entries(LEADING)) {
    const out = val.endsWith("rem")
      ? `${(parseFloat(val) * scale).toFixed(4)}em`
      : val;
    rules.push(`${scope} .leading-${name} { line-height: ${out}; }`);
  }

  // Border radius
  for (const [name, rem] of Object.entries(ROUNDED)) {
    const cls = name ? `rounded-${name}` : "rounded";
    rules.push(`${scope} .${cls} { border-radius: ${em(rem)}; }`);
  }

  // Spacing: padding / margin / gap / space-between
  const spacingProps: [string, string[]][] = [
    ["p", ["padding"]],
    ["px", ["padding-left", "padding-right"]],
    ["py", ["padding-top", "padding-bottom"]],
    ["pt", ["padding-top"]],
    ["pb", ["padding-bottom"]],
    ["pl", ["padding-left"]],
    ["pr", ["padding-right"]],
    ["m", ["margin"]],
    ["mx", ["margin-left", "margin-right"]],
    ["my", ["margin-top", "margin-bottom"]],
    ["mt", ["margin-top"]],
    ["mb", ["margin-bottom"]],
    ["ml", ["margin-left"]],
    ["mr", ["margin-right"]],
    ["gap", ["gap"]],
    ["gap-x", ["column-gap"]],
    ["gap-y", ["row-gap"]],
  ];
  for (const step of SPACING_STEPS) {
    const val = em(step * 0.25);
    const esc = cssEscapeStep(step);
    for (const [prefix, props] of spacingProps) {
      const decl = props.map((p) => `${p}: ${val};`).join(" ");
      rules.push(`${scope} .${prefix}-${esc} { ${decl} }`);
    }
    // space-y / space-x apply margin to non-first children.
    rules.push(
      `${scope} .space-y-${esc} > :not([hidden]) ~ :not([hidden]) { margin-top: ${val}; }`,
    );
    rules.push(
      `${scope} .space-x-${esc} > :not([hidden]) ~ :not([hidden]) { margin-left: ${val}; }`,
    );
  }

  // Width / height (fixed steps) + images scale naturally via em widths.
  for (const step of SPACING_STEPS) {
    const val = em(step * 0.25);
    const esc = cssEscapeStep(step);
    rules.push(`${scope} .w-${esc} { width: ${val}; }`);
    rules.push(`${scope} .h-${esc} { height: ${val}; }`);
  }

  // Max-width of content blocks
  for (const [name, rem] of Object.entries(MAX_W)) {
    rules.push(`${scope} .max-w-${name} { max-width: ${em(rem)}; }`);
  }

  // Images inside the lesson scale with the container.
  rules.push(`${scope} img { max-width: 100%; height: auto; }`);

  return rules.join("\n");
}

function readStoredSize(): LessonSize {
  if (typeof window === "undefined") return "medium";
  const stored = window.localStorage.getItem(LESSON_SIZE_STORAGE_KEY);
  if (stored === "small" || stored === "medium" || stored === "large") {
    return stored;
  }
  return "medium";
}

function applyLessonSizeStyle(size: LessonSize) {
  if (typeof document === "undefined") return;
  let styleEl = document.getElementById(
    STYLE_ELEMENT_ID,
  ) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ELEMENT_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = buildLessonSizeCss(size);
}

// Consumed by the lesson wrapper so it can carry the matching `lesson-size-*`
// class. Reads the persisted value and stays in sync with the toolbar control
// (via the custom event) and cross-tab changes (via the storage event).
export function useLessonSize(): LessonSize {
  const [size, setSize] = useState<LessonSize>(readStoredSize);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<LessonSize>).detail;
      if (detail === "small" || detail === "medium" || detail === "large") {
        setSize(detail);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LESSON_SIZE_STORAGE_KEY) setSize(readStoredSize());
    };
    window.addEventListener(LESSON_SIZE_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LESSON_SIZE_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return size;
}

interface LessonFontSizeControlProps {
  className?: string;
}

export function LessonFontSizeControl({
  className = "",
}: LessonFontSizeControlProps) {
  const [size, setSize] = useState<LessonSize>(readStoredSize);

  useEffect(() => {
    window.localStorage.setItem(LESSON_SIZE_STORAGE_KEY, size);
    applyLessonSizeStyle(size);
    window.dispatchEvent(
      new CustomEvent<LessonSize>(LESSON_SIZE_CHANGE_EVENT, { detail: size }),
    );
  }, [size]);

  useEffect(() => {
    return () => {
      const styleEl = document.getElementById(STYLE_ELEMENT_ID);
      styleEl?.parentNode?.removeChild(styleEl);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ${className}`}
      style={{ backgroundColor: "rgba(101,209,178,0.10)" }}
      role="group"
      aria-label="লেখার আকার"
    >
      {LESSON_SIZE_OPTIONS.map((option) => {
        const active = size === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setSize(option.value)}
            aria-pressed={active}
            className="text-xs font-bold px-2.5 py-1.5 rounded-md transition-all duration-200"
            style={{
              color: active ? "#04342C" : "#B8C5C1",
              backgroundColor: active ? "#65D1B2" : "transparent",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
