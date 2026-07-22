import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  show: boolean;
  isLevelCompleted: boolean;
  nextLessonLabel?: string;
  onDismiss: () => void;
}

export function LessonCompleteToast({ show, isLevelCompleted, nextLessonLabel, onDismiss }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, 4500);
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
              backgroundColor: isDark ? "#0A4A3F" : "#ffffff",
              border: `1.5px solid ${isDark ? "rgba(101,209,178,0.3)" : "#65D1B2"}`,
              boxShadow: isDark
                ? "0 8px 32px rgba(101,209,178,0.15)"
                : "0 8px 32px rgba(14,124,102,0.12)",
            }}
          >
            {/* Animated icon */}
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
                    ? "linear-gradient(135deg, #0E7C66, #65D1B2)"
                    : "linear-gradient(135deg, #0E7C66, #34D399)",
                }}
              >
                <CheckCircle2 size={22} color="#fff" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm font-black"
                  style={{ color: isDark ? "#65D1B2" : "#0E7C66" }}
                >
                  {isLevelCompleted ? "লেভেল সম্পন্ন হয়েছে!" : "পাঠ সম্পন্ন হয়েছে!"}
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <Sparkles size={14} style={{ color: isDark ? "#FFC93C" : "#FFC93C" }} />
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs mt-1 leading-relaxed"
                style={{ color: isDark ? "#B8C5C1" : "#6B7280" }}
              >
                {isLevelCompleted
                  ? "আপনি এই লেভেলের সব পাঠ সম্পন্ন করেছেন। অসাধারণ!"
                  : nextLessonLabel
                    ? `"${nextLessonLabel}" আনলক করা হয়েছে।`
                    : "পরবর্তী পাঠ আনলক করা হয়েছে।"}
              </motion.p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
              style={{ color: isDark ? "#65D1B2" : "#0E7C66" }}
            >
              ঠিক আছে
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
