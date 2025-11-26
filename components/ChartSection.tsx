
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { CategoryData } from '../types';
import { CATEGORIES, MAX_SCORE } from '../constants';

interface ChartSectionProps {
  data: CategoryData[];
  userName: string;
  dateStr: string;
}

// SVG Configuration
const SVG_SIZE = 600;
const CENTER = SVG_SIZE / 2;
const MAX_RADIUS = 220; // Radius for score 10
const LABEL_RADIUS = 260; // Radius for text labels

// Helper to calculate coordinates from angle and radius
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

// Helper to create SVG arc path
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
};

// Helper for just the arc line (for desire state border)
const describeArcLine = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  // M move to start, A arc to end (no line to center)
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

// Helper to get wedge path (pie slice)
const getWedgePath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
   return describeArc(centerX, centerY, radius, startAngle, endAngle);
};

// Helper to get wedge border path (closed loop for desire)
const getWedgeBorderPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    // Similar to wedge path but we might use fill="none" stroke="..." in the render
    return describeArc(centerX, centerY, radius, startAngle, endAngle);
};

export const ChartSection: React.FC<ChartSectionProps> = ({ data, userName, dateStr }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `${userName || 'User'}_LifeBalanceWheel.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to download image. Please try again.");
    }
  };

  const sliceAngle = 360 / CATEGORIES.length;

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Capture Area */}
      <div 
        ref={chartRef}
        className="relative bg-white rounded-3xl p-4 sm:p-8 shadow-sm w-full max-w-[650px] aspect-square flex flex-col items-center justify-between"
      >
        <div className="w-full text-center z-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-accent mb-1">生命平衡轮</h2>
        </div>

        <div className="absolute top-6 right-6 text-right text-xs sm:text-sm text-gray-400 leading-tight hidden sm:block z-10">
          <div className="font-bold text-gray-600">{userName}</div>
          <div>{dateStr}</div>
        </div>

        <div className="w-full h-full relative flex items-center justify-center">
            {/* SVG Chart */}
            <svg 
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} 
              className="w-full h-full max-h-[500px]"
              style={{ overflow: 'visible' }}
            >
              {/* Background Grid Circles */}
              {[2, 4, 6, 8, 10].map((score) => (
                <circle
                  key={score}
                  cx={CENTER}
                  cy={CENTER}
                  r={(score / MAX_SCORE) * MAX_RADIUS}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1.5"
                />
              ))}

              {/* Data Slices */}
              {CATEGORIES.map((cat, index) => {
                const item = data.find(d => d.id === cat.id);
                const currentScore = item?.current || 0;
                const desireScore = item?.desire || 0;
                
                // Calculate angles
                // Shift by -90 to start at top, then center the wedge on the angle
                const centerAngle = (index * sliceAngle); 
                const startAngle = centerAngle - (sliceAngle / 2);
                const endAngle = centerAngle + (sliceAngle / 2);

                const currentRadius = (currentScore / MAX_SCORE) * MAX_RADIUS;
                const desireRadius = (desireScore / MAX_SCORE) * MAX_RADIUS;

                // Difference calculation for label
                const diff = desireScore - currentScore;
                let diffText = `(0 分)`;
                let diffColor = '#9ca3af';
                if (diff > 0) { diffText = `(+${diff} 分)`; diffColor = '#4a4e69'; }
                else if (diff < 0) { diffText = `(${diff} 分)`; diffColor = '#ef4444'; }

                // Label Position
                const labelPos = polarToCartesian(CENTER, CENTER, LABEL_RADIUS, centerAngle);

                return (
                  <g key={cat.id}>
                    {/* Current Status Wedge (Filled) */}
                    <path
                      d={getWedgePath(CENTER, CENTER, currentRadius, startAngle, endAngle)}
                      fill={cat.fillColor}
                      stroke="none"
                      className="transition-all duration-300 ease-out"
                    />

                    {/* Desire Status Wedge (Outline/Border) */}
                    {/* We draw the wedge outline for desire to match the 'Polar Area' look */}
                    <path
                      d={getWedgeBorderPath(CENTER, CENTER, desireRadius, startAngle, endAngle)}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="transition-all duration-300 ease-out"
                    />

                    {/* Axis Line (Spokes) - drawn between slices */}
                    {/* We draw a line at the start angle of this slice to separate it from previous */}
                    <line 
                      x1={CENTER} 
                      y1={CENTER} 
                      x2={polarToCartesian(CENTER, CENTER, MAX_RADIUS, startAngle).x}
                      y2={polarToCartesian(CENTER, CENTER, MAX_RADIUS, startAngle).y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    
                    {/* Labels */}
                    <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                       <text 
                         textAnchor="middle" 
                         dominantBaseline="middle"
                         className="font-sans"
                       >
                         <tspan x="0" dy="-0.6em" fontSize="24" fontWeight="bold" fill="#374151">{cat.name}</tspan>
                         <tspan x="0" dy="1.4em" fontSize="18" fill={diffColor}>{diffText}</tspan>
                       </text>
                    </g>
                  </g>
                );
              })}
            </svg>
        </div>

        <div className="w-full text-center border-t border-gray-100 pt-3 z-10">
           <p className="text-accent font-serif font-bold text-sm sm:text-base tracking-widest">
             过有意思，有意识的人生！
           </p>
           <div className="sm:hidden text-xs text-gray-400 mt-1">
             {userName} • {dateStr}
           </div>
        </div>
      </div>

      {/* Legend / Actions */}
      <div className="mt-8 flex flex-col items-center gap-6 w-full">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
           <div className="flex items-center gap-2">
             <span className="w-4 h-4 rounded bg-gray-400/50 inline-block"></span>
             <span>核心状态 (现状-实心)</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-4 h-4 border-2 border-dashed border-gray-600 inline-block"></span>
             <span>能量边界 (渴望-虚线)</span>
           </div>
        </div>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-accent hover:bg-gray-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 font-medium tracking-wide"
        >
          <Download size={20} />
          下载对比图 (PNG)
        </button>
      </div>
    </div>
  );
};
