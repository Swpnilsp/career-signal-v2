import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  sublabel?: string;
}

export default function ScoreGauge({
  score,
  label = 'Overall Match',
  size = 160,
  strokeWidth = 12,
  sublabel
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth score counting animation on mount/update
    const duration = 1000; // 1s
    const startTime = performance.now();
    const startValue = animatedScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.round(startValue + (score - startValue) * easeProgress);
      
      setAnimatedScore(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine dynamic colors
  let colorClass = 'stroke-brand-rose';
  let textClass = 'text-brand-rose';
  let glowClass = 'shadow-brand-rose/10';

  if (animatedScore >= 80) {
    colorClass = 'stroke-brand-emerald';
    textClass = 'text-brand-emerald';
    glowClass = 'shadow-brand-emerald/10';
  } else if (animatedScore >= 60) {
    colorClass = 'stroke-brand-amber';
    textClass = 'text-brand-amber';
    glowClass = 'shadow-brand-amber/10';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div 
        className={`relative flex items-center justify-center rounded-full glass-panel border-zinc-800 shadow-xl ${glowClass} transition-shadow duration-500`}
        style={{ width: size + 24, height: size + 24 }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800/80 fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-transparent transition-all duration-300 ease-out ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score content in center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${textClass}`}>
            {animatedScore}
          </span>
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">
            of 100
          </span>
        </div>
      </div>

      {label && (
        <span className="text-zinc-200 font-semibold text-sm mt-4 tracking-wide">
          {label}
        </span>
      )}
      
      {sublabel && (
        <span className="text-zinc-500 text-xs mt-1">
          {sublabel}
        </span>
      )}
    </div>
  );
}
