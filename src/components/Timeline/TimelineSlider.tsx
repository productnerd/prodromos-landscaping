import { useState, useEffect, useRef, useCallback } from 'react';
import { useGardenStore } from '../../stores/gardenStore';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_ABBR = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function TimelineSlider() {
  const currentMonth = useGardenStore((s) => s.currentMonth);
  const setMonth = useGardenStore((s) => s.setMonth);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    useGardenStore.setState((s) => ({
      currentMonth: s.currentMonth >= 12 ? 1 : s.currentMonth + 1,
    }));
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(advance, 1500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, advance]);

  return (
    <div className="h-16 bg-gray-800 text-white flex items-center px-6 gap-4">
      {/* Play/pause */}
      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-sm flex-shrink-0"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '⏸' : '▶'}
      </button>

      {/* Month label */}
      <span className="text-lg font-semibold w-28 flex-shrink-0">
        {MONTH_LABELS[currentMonth - 1]}
      </span>

      {/* Slider area */}
      <div className="flex-1 flex flex-col justify-center gap-0.5">
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={currentMonth}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between px-0.5">
          {MONTH_ABBR.map((m, i) => (
            <span
              key={i}
              className={`text-[10px] ${
                i + 1 === currentMonth ? 'text-green-400 font-bold' : 'text-gray-400'
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
