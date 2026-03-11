import React from 'react';

interface RiskHeatmapData {
  region: string;
  timeSlot: string;
  count: number;
}

interface RiskHeatmapGridProps {
  data: RiskHeatmapData[];
}

const RiskHeatmapGrid: React.FC<RiskHeatmapGridProps> = ({ data }) => {
  const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
  
  const regions = [...new Set(data.map(d => d.region))].sort((a, b) => a.localeCompare(b));
  const timeSlots = ['0-4h', '4-8h', '8-12h', '12-16h', '16-20h', '20-24h'];
  
  const matrix: { [key: string]: number } = {};
  data.forEach(d => {
    matrix[`${d.region}|${d.timeSlot}`] = d.count;
  });
  
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  if (regions.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No data available for the selected period
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="min-w-[640px]">
        <div className="grid" style={{ gridTemplateColumns: `120px repeat(${timeSlots.length}, minmax(0, 1fr))` }}>
          <div></div>
          {timeSlots.map((slot) => (
            <div key={slot} className="text-xs text-muted-foreground p-1 text-center">{slot}</div>
          ))}
          {regions.map((region) => (
            <React.Fragment key={region}>
              <div className="text-xs text-muted-foreground p-1 pr-3 text-right">{region}</div>
              {timeSlots.map((slot) => {
                const count = matrix[`${region}|${slot}`] || 0;
                const intensity = Math.min(1, count / maxCount);
                const cellKey = `${region}-${slot}`;
                const isSelected = selectedCell === cellKey;
                const bg = isSelected 
                  ? 'rgba(239, 68, 68, 0.9)' 
                  : `rgba(239, 68, 68, ${0.15 + intensity * 0.6})`;
                return (
                  <div 
                    key={cellKey} 
                    className="h-8 m-[2px] rounded flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer" 
                    style={{ backgroundColor: bg }}
                    title={`${region} @ ${slot}: ${count} incidents`}
                    onClick={() => setSelectedCell(isSelected ? null : cellKey)}
                  >
                    {count > 0 && <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>{count}</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmapGrid;
