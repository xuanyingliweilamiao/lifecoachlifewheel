export interface CategoryConfig {
  id: string;
  name: string;
  color: string;     // The solid color for borders/text
  fillColor: string; // The transparent color for backgrounds
}

export interface CategoryData {
  id: string;
  current: number;
  desire: number;
}

export interface ChartDataPoint {
  subject: string;
  current: number;
  desire: number;
  fullMark: number;
  diff: number;
  color: string;
}
