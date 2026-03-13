import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { getSupabaseClient } from '../lib/dbClient';
import { Calendar, Plus, Clock, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LeaveBalance {
  year: number;
  annual_total: number;
  annual_used: number;
  sick_total: number;
  sick_used: number;
  personal_total: number;
  personal_used: number;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
  created_at: string;
}

const LeaveManagementPage = () => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const refreshData = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    if (supabase) {
      // Get Balance (Mocking user ID for now or using first found)
      const { data: balanceData } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', 2026)
        .limit(1)
        .single();
      setBalance(balanceData);

      // Get Requests
      const { data: requestsData } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(requestsData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (supabase) {
      // Mock user ID for dev
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || '10eebc99-9c0b-4ef8-bb6d-6bb9bd380101'; // Fallback to seed admin ID

      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          user_id: userId,
          ...formData,
          status: 'pending'
        }]);

      if (!error) {
        setShowForm(false);
        setFormData({ leave_type: 'annual', start_date: '', end_date: '', reason: '' });
        refreshData();
      } else {
        alert('Error submitting request');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <AppLayout activeSection="help-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/help-center" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500">Track balance and request time off</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Annual */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Annual Leave</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">
                {balance ? balance.annual_total - balance.annual_used : '-'}
              </span>
              <span className="ml-1 text-gray-500">/ {balance?.annual_total} days</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: balance ? `${(balance.annual_used / balance.annual_total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          {/* Sick */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Plus className="h-16 w-16 text-red-600" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Sick Leave</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">
                {balance ? balance.sick_total - balance.sick_used : '-'}
              </span>
              <span className="ml-1 text-gray-500">/ {balance?.sick_total} days</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: balance ? `${(balance.sick_used / balance.sick_total) * 100}%` : '0%' }}></div>
            </div>
          </div>

          {/* Personal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Personal Days</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-gray-900">
                {balance ? balance.personal_total - balance.personal_used : '-'}
              </span>
              <span className="ml-1 text-gray-500">/ {balance?.personal_total} days</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: balance ? `${(balance.personal_used / balance.personal_total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in-down">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Leave Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  >
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Requests */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Requests</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="p-6 text-center text-gray-500">Loading...</li>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <li key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${request.status === 'approved' ? 'bg-green-100' : request.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        {request.status === 'approved' ? <CheckCircle className={`h-5 w-5 ${getStatusColor(request.status).split(' ')[1]}`} /> :
                          request.status === 'rejected' ? <XCircle className={`h-5 w-5 ${getStatusColor(request.status).split(' ')[1]}`} /> :
                            <Clock className={`h-5 w-5 ${getStatusColor(request.status).split(' ')[1]}`} />
                        }
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 capitalize text-lg">{request.leave_type} Leave</span>
                          <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(request.start_date).toLocaleDateString()} — {new Date(request.end_date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          {request.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">No leave requests found.</li>
            )}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeaveManagementPage;
