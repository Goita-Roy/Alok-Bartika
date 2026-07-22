import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  highlighted?: boolean;
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  className = '',
  onClick,
  highlighted = false,
  animate = true,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 30 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6
        border-2 transition-all duration-300
        ${highlighted ? 'border-emerald-500 shadow-xl shadow-emerald-500/20' : 'border-transparent'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
