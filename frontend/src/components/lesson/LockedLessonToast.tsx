import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  show: boolean;
  onDismiss: () => void;
}

export function LockedLessonToast({ show, onDismiss }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md pointer-events-auto"
        >
          <div
            className="rounded-2xl px-5 py-4 shadow-2xl flex items-start gap-3"
            style={{
              backgroundColor: isDark ? "#1a1040" : "#ffffff",
              border: `1.5px solid ${isDark ? "rgba(148,163,184,0.25)" : "#D5E8E2"}`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.15 }}
              className="shrink-0 mt-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #94a3b8, #64748b)"
                    : "linear-gradient(135deg, #F59E0B, #D97706)",
                }}
              >
                <Lock size={20} color="#fff" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm font-black block"
                style={{ color: isDark ? "#94a3b8" : "#D97706" }}
              >
                ক্লাসটি লক আছে
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs mt-1 leading-relaxed"
                style={{ color: isDark ? "#94a3b8" : "#6B7280" }}
              >
                আগার ক্লাস ৮০% সম্পন্ন করলে এই ক্লাস আনলক হবে।
              </motion.p>
            </div>

            <button
              onClick={onDismiss}
              className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
              style={{ color: isDark ? "#94a3b8" : "#D97706" }}
            >
              ঠিক আছে
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
