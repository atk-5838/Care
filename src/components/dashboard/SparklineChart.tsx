import React from 'react';

interface SparklineChartProps {
  data: number[];
  color: 'red' | 'cyan' | 'emerald' | 'amber' | 'purple';
  width?: number;
  height?: number;
}

const COLOR_MAP = {
  red: {
    stroke: '#F43F5E',
    fillStart: 'rgba(244, 63, 94, 0.35)',
    fillEnd: 'rgba(244, 63, 94, 0.0)'
  },
  cyan: {
    stroke: '#06B6D4',
    fillStart: 'rgba(6, 182, 212, 0.35)',
    fillEnd: 'rgba(6, 182, 212, 0.0)'
  },
  emerald: {
    stroke: '#10B981',
    fillStart: 'rgba(16, 185, 129, 0.35)',
    fillEnd: 'rgba(16, 185, 129, 0.0)'
  },
  amber: {
    stroke: '#F59E0B',
    fillStart: 'rgba(245, 158, 11, 0.35)',
    fillEnd: 'rgba(245, 158, 11, 0.0)'
  },
  purple: {
    stroke: '#8B5CF6',
    fillStart: 'rgba(139, 92, 246, 0.35)',
    fillEnd: 'rgba(139, 92, 246, 0.0)'
  }
};

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color,
  width = 96,
  height = 32
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const availableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * availableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradientId = `spark-grad-${color}-${Math.random().toString(36).substring(2, 7)}`;
  const theme = COLOR_MAP[color] || COLOR_MAP.cyan;

  const lastPoint = points[points.length - 1].split(',');

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.fillStart} />
          <stop offset="100%" stopColor={theme.fillEnd} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Stroke line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={theme.stroke} 
        strokeWidth="1.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Pulsing endpoint dot */}
      <circle 
        cx={lastPoint[0]} 
        cy={lastPoint[1]} 
        r="2.5" 
        fill={theme.stroke} 
      />
      <circle 
        cx={lastPoint[0]} 
        cy={lastPoint[1]} 
        r="5" 
        fill={theme.stroke} 
        opacity="0.4" 
        className="animate-ping" 
      />
    </svg>
  );
};
