import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface AlertData {
  id: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

interface RealTimeAlertsProps {
  data?: AlertData[];
}

const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({ data = [] }) => {
  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border border-blue-200 text-blue-800';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Real-time Alerts
        {data.length > 0 && (
          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
            {data.length}
          </span>
        )}
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-md ${getAlertStyles(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm flex-1">{alert.message}</p>
                <div className="flex items-center text-xs ml-2 opacity-75">
                  <Clock className="w-3 h-3 mr-1" />
                  {getTimeAgo(alert.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;
