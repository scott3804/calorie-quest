interface DonutProps {
  current: number;
  target: number;
  label: string;
  unit: string;
  color: string;
}

export const GoalDonut = ({
  current,
  target,
  label,
  unit,
  color,
}: DonutProps) => {
  const remaining = Math.max(0, target - current);
  const percentage = Math.min((current / target) * 100, 100);
  const strokeDasharray = 251.2; // Circumference of a 40 radius circle
  const offset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* SVG Circle for the progress */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-black/5"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Text: The "Remaining" value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-[var(--text-primary)] leading-none">
            {remaining}
          </span>
          <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">
            {unit} Left
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">
        {label}
      </span>
    </div>
  );
};
