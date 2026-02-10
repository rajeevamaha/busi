'use client';

import { useHealthScore } from '@/hooks/use-calculations';

function getColor(score: number): string {
  if (score >= 75) return '#22c55e'; // green
  if (score >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getLabel(score: number): string {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}

export function HealthScoreGauge() {
  const score = useHealthScore();
  const color = getColor(score);
  const label = getLabel(score);

  // SVG circular gauge
  const size = 120;
  const center = size / 2;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill={color}
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          className="text-[10px]"
          fill="#6b7280"
        >
          {label}
        </text>
      </svg>
      <p className="text-xs font-medium text-muted-foreground mt-0.5">Health Score</p>
    </div>
  );
}
