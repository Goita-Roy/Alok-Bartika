import { useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { subscribeDebug, getDebug } from "./debugStore";

type Field = { label: string; value: unknown; ok: boolean };

export default function DebugPanel() {
  const s = useSyncExternalStore(subscribeDebug, getDebug);
  const location = useLocation();

  // Expected-correctness per displayed field, in display order.
  // Static fields must be valid from render; dynamic fields must follow the
  // click chain (button -> goToNext -> navigate -> url/class sync).
  const fields: Field[] = [
    { label: "Current Class", value: s.currentClass, ok: s.currentClass !== null },
    { label: "Current Index", value: s.currentIndex, ok: s.currentIndex !== null },
    { label: "Next Class", value: s.nextClass, ok: s.nextClass !== null },
    {
      label: "Next Path",
      value: s.nextPath,
      ok: !!s.nextPath && s.nextPath.startsWith("/courses/beginner/"),
    },
    { label: "Button Clicked", value: s.buttonClicked, ok: s.buttonClicked === true },
    {
      label: "goToNext Executed",
      value: s.goToNextExecuted,
      ok: !s.buttonClicked || s.goToNextExecuted === true,
    },
    {
      label: "navigate() Called",
      value: s.navigateCalled,
      ok: !s.goToNextExecuted || s.navigateCalled === true,
    },
    {
      label: "Current URL",
      value: location.pathname,
      ok: !s.navigateCalled || location.pathname === s.nextPath,
    },
    {
      label: "selectedClass.id",
      value: s.selectedClassId,
      ok: !s.navigateCalled || s.selectedClassId === s.nextClass,
    },
    {
      label: "classId (useParams)",
      value: s.classId,
      ok: !s.navigateCalled || s.classId === s.nextClass,
    },
  ];

  const firstBad = fields.findIndex((f) => !f.ok);

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99999,
        background: "#0b0b0b",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 10,
        borderRadius: 6,
        maxWidth: 340,
        pointerEvents: "none",
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 6, color: "#ff0" }}>
        DEBUG PANEL (dev only)
      </div>
      {fields.map((f, i) => (
        <div
          key={f.label}
          style={{
            background: i === firstBad ? "#7a0010" : "transparent",
            color: i === firstBad ? "#fff" : "#0f0",
            padding: "1px 4px",
            fontWeight: i === firstBad ? "bold" : "normal",
          }}
        >
          {f.label}: {String(f.value)}
        </div>
      ))}
      {firstBad >= 0 && (
        <div style={{ color: "#ff6", marginTop: 6 }}>
          First incorrect value highlighted above.
        </div>
      )}
    </div>
  );
}
