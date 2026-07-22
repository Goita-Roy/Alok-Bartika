import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface DraggableCardProps {
  id: string;
  text: string;
  index: number;
  isCorrect?: boolean | null;
  isIncorrect?: boolean;
}

export function DraggableCard({
  id,
  text,
  index,
  isCorrect,
  isIncorrect,
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-4 p-4 rounded-xl border-2
        bg-card dark:bg-card-dark
        transition-all duration-200 select-none
        ${isDragging ? 'opacity-50 shadow-2xl scale-105 z-50' : 'shadow-md'}
        ${isCorrect === true ? 'border-success bg-green-50 dark:bg-green-900/20' : ''}
        ${isCorrect === false ? 'border-danger bg-red-50 dark:bg-red-900/20 animate-shake' : ''}
        ${isIncorrect ? 'border-danger bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'}
        hover:border-primary hover:shadow-lg cursor-grab active:cursor-grabbing
      `}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shrink-0">
        {index + 1}
      </span>
      <span className="font-semibold text-text dark:text-text-dark flex-1">
        {text}
      </span>
      <svg className="w-5 h-5 text-muted dark:text-muted-dark shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    </div>
  );
}
