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
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Score arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          className="transition-all duration-700 ease-out"
        />
        {/* Score text */}
        <text
          x="90"
          y="82"
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={color}
        >
          {score}
        </text>
        <text
          x="90"
          y="104"
          textAnchor="middle"
          className="text-sm"
          fill="#6b7280"
        >
          {label}
        </text>
      </svg>
      <p className="text-sm font-medium mt-1">Business Health Score</p>
    </div>
  );
}
