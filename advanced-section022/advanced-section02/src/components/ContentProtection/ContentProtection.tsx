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
      if (["c", "x", "a", "s", "p"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener("contextmenu", handleContextMenu as EventListener);
    container.addEventListener("selectstart", handleSelectStart);
    container.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu as EventListener);
      container.removeEventListener("selectstart", handleSelectStart);
      container.removeEventListener("dragstart", handleDragStart);
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
      <div className="watermark-overlay" aria-hidden="true">
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
        <span>Educational Content</span>
      </div>

      <div className="protected-content">{children}</div>

      {showDevWarning && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 bg-amber-500 text-white text-sm font-medium rounded-xl shadow-lg"
          role="alert"
        >
          ⚠️ Please use the platform normally.
        </div>
      )}
    </div>
  );
}
