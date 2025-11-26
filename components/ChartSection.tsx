import React, { useRef } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { CategoryData, ChartDataPoint } from '../types';
import { CATEGORIES } from '../constants';

interface ChartSectionProps {
  data: CategoryData[];
  userName: string;
  dateStr: string;
}

// Custom Tick Component for the Labels + Diff
const CustomTick = ({ payload, x, y, cx, cy, ...rest }: any) => {
  const { value: categoryName, index } = payload;
  
  // Find the data associated with this category to calculate diff
  // Note: We need access to the data prop passed to the chart. 
  // Recharts doesn't pass full data to tick easily, but we can look it up if we know the order matches.
  const categoryConfig = CATEGORIES[index];
  // Retrieve the data passed down (we need to pass the current data state to this component context somehow, 
  // or rely on the index assuming standard order)
  
  // Since we can't easily pass props to the Tick component via Recharts API without a closure, 
  // we will handle the data transformation *before* rendering the chart, 
  // but Recharts Tick receives the label string.
  
  // Let's use a closure in the main component to create the render function
  return <text x={x} y={y} {...rest} />;
};


export const ChartSection: React.FC<ChartSectionProps> = ({ data, userName, dateStr }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Transform data for Recharts
  const chartData: ChartDataPoint[] = CATEGORIES.map((cat) => {
    const item = data.find(d => d.id === cat.id);
    const current = item?.current || 0;
    const desire = item?.desire || 0;
    return {
      subject: cat.name,
      current: current,
      desire: desire,
      fullMark: 10,
      diff: desire - current,
      color: cat.color
    };
  });

  // Custom Label Renderer
  const renderCustomTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    const index = payload.index;
    const dataPoint = chartData[index];
    const diff = dataPoint.diff;
    
    let diffText = `(0 分)`;
    let diffColor = '#9ca3af'; // gray-400
    
    if (diff > 0) {
      diffText = `(+${diff} 分)`;
      diffColor = '#4a4e69'; // accent
    } else if (diff < 0) {
      diffText = `(${diff} 分)`;
      diffColor = '#ef4444'; // red
    }

    // Adjust y position based on whether it's top or bottom half to prevent overlap
    // Recharts handles x/y fairly well for polar, but we can fine tune if needed.
    
    return (
      <g>
        <text x={x} y={y} textAnchor={textAnchor} className="font-sans font-bold text-xs sm:text-sm fill-slate-700">
          <tspan x={x} dy="0em">{payload.value}</tspan>
          <tspan x={x} dy="1.4em" fill={diffColor} fontSize="0.85em" fontWeight="normal">{diffText}</tspan>
        </text>
      </g>
    );
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;
    
    // Temporarily hide the download button or any other artifacts if they were inside the capture area
    // (They are outside in this layout, so we are good)
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 3, // High resolution
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

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Capture Area */}
      <div 
        ref={chartRef}
        className="relative bg-white rounded-3xl p-6 sm:p-10 shadow-sm w-full max-w-[600px] aspect-square flex flex-col items-center justify-between"
      >
        <div className="w-full text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-accent mb-2">生命平衡轮</h2>
        </div>

        <div className="absolute top-6 right-6 text-right text-xs sm:text-sm text-gray-400 leading-tight hidden sm:block">
          <div className="font-bold text-gray-600">{userName}</div>
          <div>{dateStr}</div>
        </div>

        <div className="w-full h-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid gridType="circle" stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={renderCustomTick}
                  // Increase radius to make room for double-line labels
                  radius={120} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                
                {/* Current Status - Filled Area */}
                <Radar
                  name="核心状态 (现状)"
                  dataKey="current"
                  stroke="#8884d8"
                  strokeWidth={0}
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                
                {/* Desired Status - Dashed Border, No Fill (or very transparent) */}
                <Radar
                  name="能量边界 (渴望)"
                  dataKey="desire"
                  stroke="#4a4e69"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fill="transparent"
                  fillOpacity={0}
                />
              </RadarChart>
            </ResponsiveContainer>
        </div>

        <div className="w-full text-center border-t border-gray-100 pt-4 mt-2">
           <p className="text-accent font-serif font-bold text-sm sm:text-base tracking-widest">
             过有意思，有意识的人生！
           </p>
           {/* Mobile only date/name footer since top right might be cramped */}
           <div className="sm:hidden text-xs text-gray-400 mt-2">
             {userName} • {dateStr}
           </div>
        </div>
      </div>

      {/* Legend / Actions */}
      <div className="mt-8 flex flex-col items-center gap-6 w-full">
        <div className="flex gap-6 text-sm">
           <div className="flex items-center gap-2">
             <span className="w-4 h-4 rounded bg-[#8884d8]/60 inline-block"></span>
             <span>核心状态 (现状)</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="w-4 h-4 border-2 border-dashed border-accent inline-block"></span>
             <span>能量边界 (渴望)</span>
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
