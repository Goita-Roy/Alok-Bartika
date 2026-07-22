import { motion } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: -10 - Math.random() * 20,
  color: ['#58cc02', '#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444', '#a855f7'][i % 6],
  size: 6 + Math.random() * 8,
  rotation: Math.random() * 360,
  delay: Math.random() * 0.5,
}));

export function Confetti({ active, duration = 3 }: ConfettiProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            rotate: p.rotation,
          }}
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: 0,
            y: '110vh',
            rotate: p.rotation + 720,
          }}
          transition={{
            duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}
