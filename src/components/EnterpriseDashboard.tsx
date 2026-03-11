import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import RepeatedEnterpriseShare from './RepeatedEnterpriseShare';
import EnterpriseAnalytics from './EnterpriseAnalytics';
import EnterpriseDistributionByBusinessSize from './EnterpriseDistributionByBusinessSize';
import SatisfactionScoreOverTime from './SatisfactionScoreOverTime';

const EnterpriseDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [serviceCategory, setServiceCategory] = useState<string>('');

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Enterprise Analytics Dashboard</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Service Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="123950000">Technology</option>
                <option value="123950001">Consulting</option>
                <option value="123950002">Marketing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RepeatedEnterpriseShare 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          serviceCategory={serviceCategory || undefined}
        />
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-4">Enterprise Engagement Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Period</span>
              <span className="font-medium">
                {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Category</span>
              <span className="font-medium">{serviceCategory || 'All Categories'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Score Over Time */}
      <SatisfactionScoreOverTime 
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        serviceCategory={serviceCategory || undefined}
      />

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseDistributionByBusinessSize 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          serviceCategory={serviceCategory || undefined}
        />
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Additional Analytics</h3>
          <p className="text-gray-600">More distribution charts coming soon...</p>
        </div>
      </div>

      {/* Additional Analytics */}
      <EnterpriseAnalytics />
    </div>
  );
};

export default EnterpriseDashboard;