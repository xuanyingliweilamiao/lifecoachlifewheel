import React, { useState, useEffect } from 'react';
import { CATEGORIES, DEFAULT_SCORE } from './constants';
import { CategoryData } from './types';
import { SliderGroup } from './components/SliderGroup';
import { ChartSection } from './components/ChartSection';
import { User, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [data, setData] = useState<CategoryData[]>(
    CATEGORIES.map(cat => ({
      id: cat.id,
      current: DEFAULT_SCORE,
      desire: DEFAULT_SCORE
    }))
  );
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`;
    setCurrentDate(dateString);
  }, []);

  const handleUpdate = (id: string, type: 'current' | 'desire', value: number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, [type]: value } : item
    ));
  };

  const getTitle = () => {
    if (!userName.trim()) return "生命平衡轮：现状 vs 渴望";
    return `${userName}的生命平衡轮：现状 vs 渴望`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e6add8] to-[#b28bc4] p-4 sm:p-8 md:p-12 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Top Info Bar */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 sm:px-8 shadow-sm flex flex-col sm:flex-row justify-between items-center text-white gap-4">
          <div className="flex items-center gap-2 text-sm sm:text-base font-medium opacity-90">
            <Calendar size={18} />
            <span>{currentDate}</span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto bg-white/10 rounded-full px-4 py-2 border border-white/20 focus-within:bg-white/20 transition-colors">
            <User size={18} className="text-white/80" />
            <span className="whitespace-nowrap text-sm font-medium">定制姓名:</span>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="请输入您的名字"
              className="bg-transparent border-none outline-none text-white placeholder-white/50 w-full sm:w-32 font-bold"
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
            {getTitle()}
          </h1>
          <p className="text-white/80 text-lg font-medium tracking-wide">设计 By 微辣</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[600px]">
          
          {/* Left: Inputs */}
          <div className="flex-1 lg:max-w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {CATEGORIES.map((cat) => {
              const item = data.find(d => d.id === cat.id)!;
              return (
                <SliderGroup
                  key={cat.id}
                  category={cat}
                  currentValue={item.current}
                  desireValue={item.desire}
                  onUpdate={handleUpdate}
                />
              );
            })}
          </div>

          {/* Right: Chart */}
          <div className="flex-1 min-h-[500px] flex items-center justify-center bg-gray-50/50 rounded-3xl border border-gray-100/50">
            <ChartSection 
              data={data} 
              userName={userName}
              dateStr={currentDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
