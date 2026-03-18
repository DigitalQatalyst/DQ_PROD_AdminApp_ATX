import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { useActivityLog } from '../hooks/useActivityLog';
import { Activity, Clock, User, Filter } from 'lucide-react';

const ActivityCenterPage = () => {
  // For now, we fetch 'content' logs as a sample, but in real app we'd fetch all or allow filtering
  // Since useActivityLog is entity specific, we might need a new hook or endpoint for "all activities"
  // For this demo, we'll assume we can pass specific entity type or just show a placeholder if not available
  const { logs, loading } = useActivityLog('content', 'all'); // 'all' requires backend support or just placeholder logic

  return (
    <AppLayout activeSection="activity-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Center</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor all activities across the platform.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading activities...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {logs && logs.length > 0 ? logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          <span className="font-bold text-gray-900">{log.performed_by_name || 'User'}</span>
                          <span className="text-gray-500"> {log.action} </span>
                          <span className="font-medium text-gray-900">{log.entity_type}</span>
                        </h3>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {JSON.stringify(log.details)}
                      </p>
                    </div>
                  </div>
                </li>
              )) : (
                <div className="p-8 text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by performing some actions.</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ActivityCenterPage;
