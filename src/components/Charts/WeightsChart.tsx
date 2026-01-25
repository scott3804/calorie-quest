interface WeightEntry {
  date: string;
  weight: number;
}

interface Props {
  data: WeightEntry[];
  unit: "lbs" | "kg";
}

export const WeightChart = ({ data, unit }: Props) => {
  if (data.length < 2) return <div className="...">...</div>;

  const isLbs = unit === "lbs";
  // The Target Weight for the line
  const targetWeightLbs = 215;
  const targetWeight = isLbs ? targetWeightLbs : targetWeightLbs / 2.20462;

  const processedData = data.map((d) => ({
    ...d,
    displayWeight: isLbs ? d.weight * 2.20462 : d.weight,
  }));

  // Update math to include the targetWeight in the min/max range
  const weights = [...processedData.map((d) => d.displayWeight), targetWeight];
  const minWeight = Math.min(...weights) * 0.98;
  const maxWeight = Math.max(...weights) * 1.02;
  const weightRange = maxWeight - minWeight;

  const width = 300;
  const height = 150;
  const padding = 20;

  // Calculate the Y coordinate for the Goal Line
  const targetY =
    height -
    ((targetWeight - minWeight) / weightRange) * (height - padding * 2) -
    padding;

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

        {/* --- THE GOAL LINE --- */}
        <line
          x1={padding}
          y1={targetY}
          x2={width - padding}
          y2={targetY}
          stroke="var(--accent)"
          strokeDasharray="4 2"
          strokeWidth="1"
          opacity="0.5"
        />
        <text
          x={width - padding}
          y={targetY - 4}
          textAnchor="end"
          fontSize="6"
          fontWeight="black"
          fill="var(--accent)"
          className="uppercase"
        >
          Goal: {targetWeightLbs} {unit}
        </text>

        <polyline
          fill="none"
          stroke="#22c55e"
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
              <circle cx={x} cy={y} r="3" fill="#22c55e" />
              <text
                x={x}
                y={parseFloat(y) - 8}
                textAnchor="middle"
                fontSize="7"
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
