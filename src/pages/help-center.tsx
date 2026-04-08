import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, FileText, Monitor, GraduationCap, ChevronRight, Bell } from 'lucide-react';

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Hardcoded for demo/MVP, in real app could be fetched/configured
  const resources = [
    {
      id: 'leave',
      title: 'Leave Management',
      description: 'Submit leave applications, check your balance, and view company holidays',
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      action: () => navigate('/leave-management'),
      color: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'hr',
      title: 'Company Policies Hub',
      description: 'Access employee handbook, code of conduct, and HR guidelines',
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      action: () => { }, // Placeholder for future policy page
      color: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'it',
      title: 'Technical Resources',
      description: 'Request equipment, report issues, and access software licenses',
      icon: <Monitor className="h-8 w-8 text-emerald-600" />,
      action: () => navigate('/support-tickets'), // Reusing IT support tickets
      color: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      id: 'lnd',
      title: 'Learning & Development',
      description: 'Training programs, certifications, and skill development resources',
      icon: <GraduationCap className="h-8 w-8 text-orange-600" />,
      action: () => { }, // Placeholder
      color: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <AppLayout activeSection="help-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-10 text-white relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                <Bell className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Digital Qatalyst Hub</h1>
            <p className="mt-2 text-blue-100 text-lg">Internal tools, policies, and resources for team members</p>

            <div className="mt-8 max-w-2xl">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-11 pr-4 py-3.5 border border-transparent rounded-xl leading-5 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:ring-0 sm:text-sm transition-all shadow-lg backdrop-blur-md"
                  placeholder="Search for policies, request forms, and company resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Internal Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={resource.action}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group flex items-start"
            >
              <div className={`flex-shrink-0 p-3 rounded-lg ${resource.color}`}>
                {resource.icon}
              </div>
              <div className="ml-5 flex-1">
                <h3 className={`text-lg font-semibold ${resource.textColor} group-hover:text-gray-900 transition-colors`}>
                  {resource.title}
                </h3>
                <p className="mt-1 text-gray-500 text-sm leading-relaxed">
                  {resource.description}
                </p>
              </div>
              <div className="mt-2 text-gray-300 group-hover:text-blue-500 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links / Recent (Optional expansion) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/leave-management')} className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-700 transition-colors flex items-center">
                Apply for Leave
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-700 transition-colors flex items-center">
                View Pay Slip
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-700 transition-colors flex items-center">
                Book Meeting Room
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Company News</h3>
            <div className="space-y-4">
              <div className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Q3 All-Hands Meeting</p>
                  <p className="text-xs text-gray-500 mt-0.5">Join us this Friday at 3 PM for updates.</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">Today</span>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 mt-2 rounded-full bg-purple-500 flex-shrink-0 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Health Benefit Providers</p>
                  <p className="text-xs text-gray-500 mt-0.5">We have updated our list of medical partners.</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">2d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HelpCenterPage;
