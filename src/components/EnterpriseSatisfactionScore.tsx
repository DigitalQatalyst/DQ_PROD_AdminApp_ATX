import React, { useEffect, useState } from 'react';
import EnterprisesService, { EnterpriseSatisfactionScoreData } from '../api/analytics/enterprises';

interface EnterpriseSatisfactionScoreProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

const EnterpriseSatisfactionScore: React.FC<EnterpriseSatisfactionScoreProps> = ({
  startDate,
  endDate,
  serviceCategory = 'all'
}) => {
  const [data, setData] = useState<EnterpriseSatisfactionScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching enterprise satisfaction score with params:', { startDate, endDate, serviceCategory });
        const result = await EnterprisesService.getEnterpriseSatisfactionScore({
          startDate,
          endDate,
          serviceCategory: serviceCategory !== 'all' ? serviceCategory : undefined
        });
        console.log('Enterprise satisfaction score result:', result);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch enterprise satisfaction score:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-lg font-semibold mb-4">Enterprise Satisfaction Score</h3>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-lg font-semibold mb-4">Enterprise Satisfaction Score</h3>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
      <h3 className="text-lg font-semibold mb-4">Enterprise Satisfaction Score</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-bold text-green-600">
          {data.satisfactionScore.toFixed(1)}/5.0
        </div>
        <div className={`flex items-center text-sm ${getTrendColor(data.trend)}`}>
          {getTrendIcon(data.trend)}
          <span className="ml-1">{data.trendValue}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Repeat Usage Rate:</span>
          <span className="font-medium">{data.repeatUsageRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Active Enterprises:</span>
          <span className="font-medium">{data.activeEnterprises}</span>
        </div>
        <div className="flex justify-between">
          <span>Repeated Enterprises:</span>
          <span className="font-medium">{data.repeatedEnterprises}</span>
        </div>
        <div className="flex justify-between">
          <span>Target:</span>
          <span className="font-medium">{data.target.toFixed(1)}/5.0</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(data.satisfactionScore / 5) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Based on enterprise repeat usage patterns
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSatisfactionScore;