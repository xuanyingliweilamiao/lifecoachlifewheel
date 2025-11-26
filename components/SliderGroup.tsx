import React from 'react';
import { CategoryConfig } from '../types';
import { MAX_SCORE } from '../constants';

interface SliderGroupProps {
  category: CategoryConfig;
  currentValue: number;
  desireValue: number;
  onUpdate: (id: string, type: 'current' | 'desire', value: number) => void;
}

const Slider: React.FC<{
  value: number;
  max: number;
  color: string;
  onChange: (val: number) => void;
  isDesire?: boolean;
}> = ({ value, max, color, onChange, isDesire = false }) => {
  
  // Create the gradient background for the slider track
  const percentage = (value / max) * 100;
  const backgroundStyle = {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`w-10 font-medium ${isDesire ? 'text-accent font-bold' : 'text-gray-500'}`}>
        {isDesire ? '渴望' : '现状'}
      </span>
      
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{
          ...backgroundStyle,
          '--thumb-color': color, 
        } as React.CSSProperties} 
      />
      
      <span 
        className="w-8 text-right font-bold text-lg tabular-nums"
        style={{ color: isDesire ? color : '#374151' }}
      >
        {value}
      </span>
      
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid ${color};
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          margin-top: -1px; /* visual alignment */
        }
      `}</style>
    </div>
  );
};

export const SliderGroup: React.FC<SliderGroupProps> = ({ 
  category, 
  currentValue, 
  desireValue, 
  onUpdate 
}) => {
  return (
    <div className="bg-white/50 border-l-4 rounded-lg p-4 transition-all hover:bg-white/80 hover:shadow-sm" 
         style={{ borderLeftColor: category.color }}>
      <h3 className="font-bold mb-3 text-base tracking-wide" style={{ color: category.color }}>
        {category.name}
      </h3>
      
      <div className="flex flex-col gap-2">
        <Slider 
          value={currentValue} 
          max={MAX_SCORE} 
          color={category.color.replace('rgb', 'rgba').replace(')', ', 0.5)')} // Solid but slightly muted for current
          onChange={(val) => onUpdate(category.id, 'current', val)} 
        />
        <Slider 
          value={desireValue} 
          max={MAX_SCORE} 
          color={category.color}
          onChange={(val) => onUpdate(category.id, 'desire', val)} 
          isDesire
        />
      </div>
    </div>
  );
};
