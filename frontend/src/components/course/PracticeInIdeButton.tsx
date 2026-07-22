import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

type PracticeInIdeButtonProps = {
  lessonId?: string;
  courseId?: string;
  className?: string;
};

// Reusable shortcut that opens the existing IDE (/development) from a lesson
// page. Reuses the same route already used by LessonViewPage / PracticeSection
// — it does NOT create a new IDE.
export function PracticeInIdeButton({ lessonId, courseId, className }: PracticeInIdeButtonProps) {
  const to = lessonId && courseId
    ? `/development?lessonId=${lessonId}&courseId=${courseId}`
    : '/development';

  return (
    <div className="flex justify-center pb-2 pt-2">
      <Link
        to={to}
        className={
          'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-105 ' +
          (className ?? '')
        }
        style={{ backgroundColor: '#65D1B2', color: '#04342C', boxShadow: '0 0 16px rgba(101,209,178,0.2)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#8FE3CC' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#65D1B2' }}
      >
        <Cpu size={16} /> 🚀 IDE-তে Practice করুন
      </Link>
    </div>
  );
}
