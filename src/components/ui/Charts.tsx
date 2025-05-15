interface ChartData {
  label?: string;
  date?: string;
  class?: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
}

export function BarChart({ data }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-primary-500 rounded-t"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <span className="text-xs text-muted mt-2">
            {item.label || item.date || item.class}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / maxValue) * 100
  }));

  const path = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="h-64 relative">
      <svg className="w-full h-full">
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth="2"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="4"
            fill="var(--color-primary-500)"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted">
        {data.map((item, index) => (
          <span key={index}>{item.date}</span>
        ))}
      </div>
    </div>
  );
} 