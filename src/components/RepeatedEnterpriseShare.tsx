import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Repeat } from 'lucide-react';
import EnterprisesService, { RepeatedEnterpriseShareData } from '../api/analytics/enterprises';

interface RepeatedEnterpriseShareProps {
  startDate: string;
  endDate: string;
  serviceCategory?: string;
}

const RepeatedEnterpriseShare: React.FC<RepeatedEnterpriseShareProps> = ({
  startDate,
  endDate,
  serviceCategory
}) => {
  const [data, setData] = useState<RepeatedEnterpriseShareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await EnterprisesService.getRepeatedEnterpriseShare({
          startDate,
          endDate,
          serviceCategory
        });
        setData(result);
      } catch (error) {
        console.error('Failed to fetch repeated enterprise share:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, serviceCategory]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    const percentage = (data.repeatedEnterpriseShare / data.target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Repeat className="w-5 h-5 mr-2 text-purple-600" />
          Repeated Enterprise Share
        </h3>
        <div className={`flex items-center ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1 text-sm font-medium">{data.trendValue}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-800 mb-1">
          {data.repeatedEnterpriseShare}%
        </div>
        <p className="text-sm text-gray-600">
          {data.repeatedEnterprises} of {data.activeEnterprises} active enterprises
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress to Target</span>
          <span>{data.target}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor()}`}
            style={{ width: `${Math.min((data.repeatedEnterpriseShare / data.target) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <Users className="w-4 h-4 text-blue-600 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{data.activeEnterprises}</div>
            <div className="text-gray-600">Active Enterprises</div>
          </div>
        </div>
        <div className="flex items-center">
          <Repeat className="w-4 h-4 text-purple-600 mr-2" />
          <div>
            <div className="font-medium text-gray-900">{data.repeatedEnterprises}</div>
            <div className="text-gray-600">Repeated Enterprises</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Percentage of enterprises that submitted more than one service request during the selected period
        </p>
      </div>
    </div>
  );
};

export default RepeatedEnterpriseShare;