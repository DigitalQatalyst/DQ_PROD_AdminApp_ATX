import React, { useEffect, useState } from 'react';
import EnterprisesService, { AvgRequestsPerActiveEnterpriseData } from '../api/analytics/enterprises';
import RepeatedEnterpriseShare from './RepeatedEnterpriseShare';
import EnterpriseSatisfactionScore from './EnterpriseSatisfactionScore';

const EnterpriseAnalytics: React.FC = () => {
  const [data, setData] = useState<AvgRequestsPerActiveEnterpriseData | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate date range for current month
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await EnterprisesService.getAvgRequestsPerActiveEnterprise({
          dateRange: 'thismonth',
          serviceCategory: 'all'
        });
        setData(result);
      } catch (error) {
        console.error('Failed to fetch enterprise analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold mb-4">Average Requests per Active Enterprise</h3>
        {data && (
          <div>
            <div className="text-2xl font-bold">{data.avgRequestsPerActive}</div>
            <div className="text-sm text-gray-600">
              {data.totalRequests} requests / {data.activeEnterprises} active enterprises
            </div>
          </div>
        )}
      </div>
      
      <RepeatedEnterpriseShare 
        startDate={startDate}
        endDate={endDate}
      />
      
      <EnterpriseSatisfactionScore 
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default EnterpriseAnalytics;