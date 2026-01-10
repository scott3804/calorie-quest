interface WeightEntry {
  date: string;
  weight: number;
}

interface Props {
  data: WeightEntry[];
  unit: "lbs" | "kg";
}

export const WeightChart = ({ data, unit }: Props) => {
  if (data.length < 2)
    return (
      <div className="h-48 flex items-center justify-center bg-black/5 rounded-3xl border-2 border-dashed border-black/10 opacity-40 italic text-xs">
        More data needed for trend lines...
      </div>
    );

  // 1. Convert data to preferred unit
  const isLbs = unit === "lbs";
  const processedData = data.map((d) => ({
    ...d,
    displayWeight: isLbs ? d.weight * 2.20462 : d.weight,
  }));

  // 2. Chart Math
  const weights = processedData.map((d) => d.displayWeight);
  const minWeight = Math.min(...weights) * 0.95; // 5% padding below
  const maxWeight = Math.max(...weights) * 1.05; // 5% padding above
  const weightRange = maxWeight - minWeight;

  const width = 300;
  const height = 150;
  const padding = 20;

  // 3. Map values to SVG coordinates
  const points = processedData
    .map((d, i) => {
      const x =
        (i / (processedData.length - 1)) * (width - padding * 2) + padding;
      const y =
        height -
        ((d.displayWeight - minWeight) / weightRange) * (height - padding * 2) -
        padding;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-[var(--bg-card)] p-4 rounded-3xl border border-black/5 shadow-sm">
      <h4 className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-4">
        Weight Trend ({unit})
      </h4>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        {/* Horizontal Grid Lines */}
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="currentColor"
          strokeOpacity="0.05"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          strokeOpacity="0.05"
        />

        {/* The Line */}
        <polyline
          fill="none"
          stroke="#22c55e" // Green for Weight/Progress
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data Points */}
        {processedData.map((d, i) => {
          const [x, y] = points.split(" ")[i].split(",");
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#22c55e" />
              <text
                x={x}
                y={parseFloat(y) - 10}
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.6"
              >
                {Math.round(d.displayWeight)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
