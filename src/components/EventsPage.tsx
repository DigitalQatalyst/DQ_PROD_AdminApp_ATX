import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, FilterIcon, EyeIcon, EditIcon, TrashIcon, ChevronDownIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';
import { AppLayout } from './AppLayout';

export interface Event {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  delivery_mode: string;
  cost_type: string;
  duration_band: string;
  language: string;
  capability?: string | string[];
  business_stage?: string | string[];
  industry?: string;
  organizer: string;
  start_date: string;
  end_date?: string;
  location?: string;
  venue_url?: string;
  thumbnail_url?: string;
  agenda_items?: AgendaItem[];
  featured_speakers?: Speaker[];
  visitor_gains?: string[];
  status: 'Draft' | 'Published' | 'Archived';
  created_at?: string;
  updated_at?: string;
  organization_id?: string;
  created_by?: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface Speaker {
  id: string;
  name: string;
  company: string;
  location?: string;
  image_url?: string;
}

// Filter options
const TIME_RANGES = ['All', 'Today', 'This Week', 'Next 30 Days', 'Custom'];
const EVENT_TYPES = ['All', 'Expo/Trade Show', 'Networking', 'Competition', 'Pitch Day', 'Webinar', 'Workshop', 'Seminar', 'Panel', 'Conference'];
const DELIVERY_MODES = ['All', 'Online', 'Onsite', 'Hybrid'];
const COST_TYPES = ['All', 'Free', 'Paid'];

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: events, loading, error, list, remove } = useCRUD<Event>('events');

  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('All');
  const [eventType, setEventType] = useState('All');
  const [deliveryMode, setDeliveryMode] = useState('All');
  const [costType, setCostType] = useState('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      list();
    }
  }, [authLoading, list]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await remove(id);
      setToast({ type: 'success', message: 'Event deleted successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete event' });
    }
  };

  // Filter events
  const filteredEvents = (events || []).filter(event => {
    if (searchQuery && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (eventType !== 'All' && event.event_type !== eventType) return false;
    if (deliveryMode !== 'All' && event.delivery_mode !== deliveryMode) return false;
    if (costType !== 'All' && event.cost_type !== costType) return false;
    
    // Time range filter
    if (timeRange !== 'All' && timeRange !== 'Custom') {
      const eventDate = new Date(event.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (timeRange === 'Today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (eventDate < today || eventDate >= tomorrow) return false;
      } else if (timeRange === 'This Week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (eventDate < today || eventDate >= weekEnd) return false;
      } else if (timeRange === 'Next 30 Days') {
        const monthEnd = new Date(today);
        monthEnd.setDate(monthEnd.getDate() + 30);
        if (eventDate < today || eventDate >= monthEnd) return false;
      }
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDeliveryModeStyle = (mode: string) => {
    switch (mode) {
      case 'Online': return 'bg-blue-100 text-blue-800';
      case 'Onsite': return 'bg-green-100 text-green-800';
      case 'Hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostTypeStyle = (cost: string) => {
    return cost === 'Free' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
  };

  if (authLoading || loading) {
    return (
      <AppLayout activeSection="events">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeSection="events">
      <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Events Management</h1>
              <p className="text-sm text-gray-500">Create and manage events, workshops, and conferences</p>
            </div>
            <Can I="create" a="Content">
              <button
                onClick={() => navigate('/event-form')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Create Event
              </button>
            </Can>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {TIME_RANGES.map(range => (
                  <option key={range} value={range}>{range === 'All' ? 'All Times' : range}</option>
                ))}
              </select>

              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                ))}
              </select>

              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {DELIVERY_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode === 'All' ? 'All Modes' : mode}</option>
                ))}
              </select>

              <select
                value={costType}
                onChange={(e) => setCostType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {COST_TYPES.map(cost => (
                  <option key={cost} value={cost}>{cost === 'All' ? 'All Costs' : cost}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {event.thumbnail_url && (
                  <img src={event.thumbnail_url} alt={event.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.name}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDeliveryModeStyle(event.delivery_mode)}`}>
                      {event.delivery_mode}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCostTypeStyle(event.cost_type)}`}>
                      {event.cost_type}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {event.event_type}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(event.start_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {event.organizer}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      event.status === 'Published' ? 'bg-green-100 text-green-800' :
                      event.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {event.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/event-form/${event.id}`)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <Can I="delete" a="Content">
                        <button
                          onClick={() => handleDelete(event.id, event.name)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </Can>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </AppLayout>
  );
};

export default EventsPage;
