import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const variants = {
  primary:
    'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl',
  secondary:
    'bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl',
  success:
    'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
  ghost:
    'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-500',
  outline:
    'bg-transparent text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-10 py-4 text-xl',
};

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        font-bold rounded-xl transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
