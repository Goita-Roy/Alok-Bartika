import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
}

const COLORS = ['#58cc02', '#1cb0f6', '#ff9600', '#ff4b4b', '#ce82ff', '#ffc800'];

export function Confetti({ active }: ConfettiProps) {
  const [pieces, setPieces] = useState<{ id: number; color: string; left: string; delay: string; size: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      size: Math.random() * 8 + 4,
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece rounded-sm"
          style={{
            left: p.left,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
