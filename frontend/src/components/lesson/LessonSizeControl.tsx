/* eslint-disable react-refresh/only-export-components -- helpers co-located with the component */

// ── Unified lesson font-size / reading-size control ────────────────────────
// Identical visual control used by Beginner, Intermediate and Advanced.
// Each level manages its own persistence (localStorage key, CSS scope, event)
// and passes `value` + `onChange` to this component. The UI is pixel-identical
// across all three levels.

export type SizeOption = "small" | "medium" | "large";

const OPTIONS: { value: SizeOption; label: string }[] = [
  { value: "small", label: "ছোট" },
  { value: "medium", label: "মাঝারি" },
  { value: "large", label: "বড়" },
];

interface LessonSizeControlProps {
  value: SizeOption;
  onChange: (size: SizeOption) => void;
  className?: string;
}

export function LessonSizeControl({
  value,
  onChange,
  className = "",
}: LessonSizeControlProps) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ${className}`}
      style={{ backgroundColor: "rgba(101,209,178,0.10)" }}
      role="group"
      aria-label="লেখার আকার"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
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

// ── Helper: convert readingSize number to SizeOption ──────────────────────
export function readingSizeToOption(size: number): SizeOption {
  if (size <= 0.875) return "small";
  if (size >= 1.15) return "large";
  return "medium";
}

export function optionToReadingSize(option: SizeOption): number {
  switch (option) {
    case "small": return 0.85;
    case "medium": return 1;
    case "large": return 1.15;
  }
}
