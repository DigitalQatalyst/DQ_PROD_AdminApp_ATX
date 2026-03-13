import React from 'react';
import { Clock } from 'lucide-react';

interface StageCycleTimeData {
  stage: string;
  avgTime: number;
  target: number;
}

interface StageCycleTimeChartProps {
  data?: StageCycleTimeData[];
}

const StageCycleTimeChart: React.FC<StageCycleTimeChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Cycle Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxTime = Math.max(...data.map(d => Math.max(d.avgTime, d.target)));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Stage Cycle Time (hours)
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const isOverTarget = item.avgTime > item.target;
          const percentage = (item.avgTime / maxTime) * 100;
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isOverTarget ? 'text-red-600' : 'text-green-600'}`}>
                    {item.avgTime}h
                  </span>
                  <span className="text-xs text-gray-500">
                    (target: {item.target}h)
                  </span>
                </div>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                {/* Target line */}
                <div
                  className="absolute inset-y-0 border-r-2 border-dashed border-gray-400"
                  style={{ left: `${(item.target / maxTime) * 100}%` }}
                />
                {/* Actual time bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                    isOverTarget 
                      ? 'bg-gradient-to-r from-red-400 to-red-500' 
                      : 'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Within Target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Over Target</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-gray-400"></div>
          <span>Target Line</span>
        </div>
      </div>
    </div>
  );
};

export default StageCycleTimeChart;
