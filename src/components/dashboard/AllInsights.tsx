import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface InsightData {
  id: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

interface AllInsightsProps {
  data?: InsightData[];
}

const AllInsights: React.FC<AllInsightsProps> = ({ data = [] }) => {
  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'low':
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
        AI-Powered Insights
        {data.length > 0 && (
          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
            {data.length} insights
          </span>
        )}
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No insights available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((insight) => (
            <div 
              key={insight.id} 
              className={`border-l-4 pl-4 py-3 rounded-r-md ${getImpactStyles(insight.impact)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  {getImpactIcon(insight.impact)}
                  {insight.title}
                </h4>
                <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                  {insight.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">{insight.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {insight.impact.toUpperCase()} IMPACT
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllInsights;
