import { CategoryConfig } from './types';

export const CATEGORIES: CategoryConfig[] = [
  { 
    id: 'family', 
    name: '家庭和朋友', 
    color: 'rgb(255, 100, 50)', 
    fillColor: 'rgba(255, 127, 80, 0.7)' 
  },
  { 
    id: 'love', 
    name: '爱情', 
    color: 'rgb(255, 50, 90)', 
    fillColor: 'rgba(255, 99, 132, 0.7)' 
  },
  { 
    id: 'fun', 
    name: '乐趣/消遣', 
    color: 'rgb(255, 140, 0)', 
    fillColor: 'rgba(255, 159, 64, 0.7)' 
  },
  { 
    id: 'health', 
    name: '健康', 
    color: 'rgb(120, 80, 255)', 
    fillColor: 'rgba(153, 102, 255, 0.7)' 
  },
  { 
    id: 'money', 
    name: '金钱', 
    color: 'rgb(0, 128, 255)', 
    fillColor: 'rgba(54, 162, 235, 0.7)' 
  },
  { 
    id: 'growth', 
    name: '个人成长', 
    color: 'rgb(0, 150, 150)', 
    fillColor: 'rgba(75, 192, 192, 0.7)' 
  },
  { 
    id: 'environment', 
    name: '生活环境', 
    color: 'rgb(50, 205, 50)', 
    fillColor: 'rgba(99, 255, 132, 0.7)' 
  },
  { 
    id: 'career', 
    name: '职业生涯', 
    color: 'rgb(255, 180, 0)', 
    fillColor: 'rgba(255, 205, 86, 0.7)' 
  }
];

export const DEFAULT_SCORE = 5;
export const MAX_SCORE = 10;
