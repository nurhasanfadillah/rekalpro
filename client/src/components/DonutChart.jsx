function DonutChart({ data, size = 200, thickness = 40 }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ];

  let cumulativePercent = 0;

  const slices = data.map((item, index) => {
    const percent = item.value / total;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    const startAngle = startPercent * circumference;
    const sliceLength = percent * circumference;
    const gap = 2;

    return {
      ...item,
      color: COLORS[index % COLORS.length],
      strokeDasharray: `${Math.max(0, sliceLength - gap)} ${circumference - Math.max(0, sliceLength - gap)}`,
      strokeDashoffset: circumference / 4 - startAngle,
    };
  });

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Donut */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={thickness}
          />
          {/* Slices */}
          {slices.map((slice, index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-sm font-bold text-gray-800 text-center leading-tight px-2">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {slices.map((slice, index) => {
          const percent = ((slice.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-700 truncate font-medium">{slice.label}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{percent}%</span>
                </div>
                {/* Progress bar */}
                <div className="mt-0.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%`, backgroundColor: slice.color }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(slice.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DonutChart;
