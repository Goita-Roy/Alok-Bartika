import { useEffect, useState, type ReactNode } from "react";

interface ContentProtectionProps {
  children: ReactNode;
  className?: string;
}

export function ContentProtection({ children, className = "" }: ContentProtectionProps) {
  const [showDevWarning, setShowDevWarning] = useState(false);

  useEffect(() => {
    const container = document.querySelector("[data-protect]");
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (!isCmd) return;

      const key = e.key.toLowerCase();
      if (!["c", "x", "a", "s", "p"].includes(key)) return;

      // Allow copy/cut/select-all inside interactive fields so notes, the code
      // editor, quiz and search inputs keep working normally.
      const el = e.target as HTMLElement | null;
      if (
        (key === "c" || key === "x" || key === "a") &&
        el &&
        typeof el.closest === "function" &&
        el.closest('input, textarea, select, [contenteditable="true"], [data-allow-copy]')
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
    };

    // Interactive fields (buttons/inputs/notes textarea/code editor/quiz/search)
    // must keep working, so copy/cut/context/selection is only blocked outside them.
    const isInteractive = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el || typeof el.closest !== "function") return false;
      return !!el.closest(
        'input, textarea, select, button, a, [contenteditable="true"], [data-allow-copy]',
      );
    };

    const handleContextMenu = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    const handleSelectStart = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    const handleDragStart = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    const handleCopy = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    const handleCut = (e: Event) => {
      if (isInteractive(e.target)) return;
      e.preventDefault();
    };

    container.addEventListener("contextmenu", handleContextMenu as EventListener);
    container.addEventListener("selectstart", handleSelectStart);
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("copy", handleCopy as EventListener);
    container.addEventListener("cut", handleCut as EventListener);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu as EventListener);
      container.removeEventListener("selectstart", handleSelectStart);
      container.removeEventListener("dragstart", handleDragStart);
      container.removeEventListener("copy", handleCopy as EventListener);
      container.removeEventListener("cut", handleCut as EventListener);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const threshold = 160;

    const detect = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        setShowDevWarning(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setShowDevWarning(false), 4000);
      }
    };

    window.addEventListener("resize", detect);
    return () => {
      window.removeEventListener("resize", detect);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      data-protect
      className={`content-protected ${className}`}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <style>{`
        [data-protect] input,
        [data-protect] textarea,
        [data-protect] select,
        [data-protect] [contenteditable="true"],
        [data-protect] [data-allow-copy] {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          -webkit-touch-callout: default;
        }
      `}</style>

      <div className="protected-content">{children}</div>

      {showDevWarning && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 bg-amber-500 text-white text-sm font-medium rounded-xl shadow-lg"
          role="alert"
        >
          ⚠️ অনুগ্রহ করে প্ল্যাটফর্মটি স্বাভাবিকভাবে ব্যবহার করুন।
        </div>
      )}
    </div>
  );
}
