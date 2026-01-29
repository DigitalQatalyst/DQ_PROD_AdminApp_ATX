import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, ImageIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Toast } from './ui/Toast';
import { AppLayout } from './AppLayout';
import type { Event, AgendaItem, Speaker } from './EventsPage';

// Options for dropdowns
const EVENT_TYPES = ['Expo/Trade Show', 'Networking', 'Competition', 'Pitch Day', 'Webinar', 'Workshop', 'Seminar', 'Panel', 'Conference'];
const DELIVERY_MODES = ['Online', 'Onsite', 'Hybrid'];
const COST_TYPES = ['Free', 'Paid'];
const DURATION_BANDS = ['Short', 'Medium', 'Long', 'Multi-Days'];
const LANGUAGES = ['English', 'Arabic'];
const CAPABILITIES = ['Leadership', 'Innovation', 'Digital Transformation', 'Financial Management', 'Marketing', 'Operations'];
const BUSINESS_STAGES = ['Ideation', 'Launch', 'Growth', 'Expansion', 'Optimization'];
const INDUSTRIES = ['Mukaa', 'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Real Estate', 'Education', 'Hospitality'];
const ORGANIZERS = ['Development Bank', 'Partner'];

export const EventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const isEditMode = !!eventId;
  const { user, isLoading: authLoading } = useAuth();
  const { getById, create, update } = useCRUD<Event>('events');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    description: '',
    event_type: 'Workshop',
    delivery_mode: 'Onsite',
    cost_type: 'Free',
    duration_band: 'Short',
    language: 'English',
    capability: [] as string[],
    business_stage: [] as string[],
    industry: '',
    organizer: 'Development Bank',
    start_date: '',
    end_date: '',
    location: '',
    venue_url: '',
    thumbnail_url: '',
    status: 'Draft',
  });

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [visitorGains, setVisitorGains] = useState<string[]>([]);

  // Load event data if editing
  useEffect(() => {
    const loadEvent = async () => {
      if (!isEditMode) return;
      setLoading(true);
      try {
        const event = await getById(eventId);
        if (event) {
          // Ensure array format (handles both array and legacy string data)
          const ensureArray = (val: any): string[] => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val) return [val];
            return [];
          };
          
          setFormData({
            name: event.name,
            description: event.description,
            event_type: event.event_type,
            delivery_mode: event.delivery_mode,
            cost_type: event.cost_type,
            duration_band: event.duration_band,
            language: event.language,
            capability: ensureArray(event.capability),
            business_stage: ensureArray(event.business_stage),
            industry: event.industry,
            organizer: event.organizer,
            start_date: event.start_date?.split('T')[0] || '',
            end_date: event.end_date?.split('T')[0] || '',
            location: event.location,
            venue_url: event.venue_url,
            thumbnail_url: event.thumbnail_url,
            status: event.status,
          });
          setAgendaItems(event.agenda_items || []);
          setSpeakers(event.featured_speakers || []);
          setVisitorGains(event.visitor_gains || []);
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load event' });
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId, isEditMode, getById]);

  const handleChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Agenda items handlers
  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { id: Date.now().toString(), time: '', title: '', description: '' }]);
  };

  const updateAgendaItem = (id: string, field: keyof AgendaItem, value: string) => {
    setAgendaItems(agendaItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
  };

  // Speakers handlers
  const addSpeaker = () => {
    setSpeakers([...speakers, { id: Date.now().toString(), name: '', company: '', location: '', image_url: '' }]);
  };

  const updateSpeaker = (id: string, field: keyof Speaker, value: string) => {
    setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter(s => s.id !== id));
  };

  // Visitor gains handlers
  const addVisitorGain = () => {
    setVisitorGains([...visitorGains, '']);
  };

  const updateVisitorGain = (index: number, value: string) => {
    const updated = [...visitorGains];
    updated[index] = value;
    setVisitorGains(updated);
  };

  const removeVisitorGain = (index: number) => {
    setVisitorGains(visitorGains.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.event_type) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const eventData = {
        ...formData,
        // Convert empty strings to undefined for timestamp fields
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        // Send arrays directly - Supabase handles TEXT[] conversion
        capability: formData.capability || [],
        business_stage: formData.business_stage || [],
        agenda_items: agendaItems,
        featured_speakers: speakers,
        visitor_gains: visitorGains.filter(g => g.trim() !== ''),
      };

      if (isEditMode) {
        await update(eventId, eventData);
        setToast({ type: 'success', message: 'Event updated successfully' });
      } else {
        await create(eventData);
        setToast({ type: 'success', message: 'Event created successfully' });
      }
      
      setTimeout(() => navigate('/events'), 1500);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save event' });
    } finally {
      setSubmitting(false);
    }
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
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/events')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="text-sm text-gray-500">Fill in the event details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => handleChange('event_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode *</label>
                <select
                  value={formData.delivery_mode}
                  onChange={(e) => handleChange('delivery_mode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {DELIVERY_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type *</label>
                <select
                  value={formData.cost_type}
                  onChange={(e) => handleChange('cost_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {COST_TYPES.map(cost => <option key={cost} value={cost}>{cost}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={formData.duration_band}
                  onChange={(e) => handleChange('duration_band', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {DURATION_BANDS.map(band => <option key={band} value={band}>{band}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
                <select
                  value={formData.organizer}
                  onChange={(e) => handleChange('organizer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ORGANIZERS.map(org => <option key={org} value={org}>{org}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Date & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., Doha, Qatar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue URL (for online events)</label>
                <input
                  type="url"
                  value={formData.venue_url}
                  onChange={(e) => handleChange('venue_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Categorization */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Categorization</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capability (select multiple)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {CAPABILITIES.map(cap => (
                    <label key={cap} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.capability as string[] || []).includes(cap)}
                        onChange={(e) => {
                          const current = formData.capability as string[] || [];
                          if (e.target.checked) {
                            handleChange('capability', [...current, cap]);
                          } else {
                            handleChange('capability', current.filter(c => c !== cap));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cap}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Stage (select multiple)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {BUSINESS_STAGES.map(stage => (
                    <label key={stage} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.business_stage as string[] || []).includes(stage)}
                        onChange={(e) => {
                          const current = formData.business_stage as string[] || [];
                          if (e.target.checked) {
                            handleChange('business_stage', [...current, stage]);
                          } else {
                            handleChange('business_stage', current.filter(s => s !== stage));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Event Agenda */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Event Agenda</h2>
              <button
                type="button"
                onClick={addAgendaItem}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Item
              </button>
            </div>
            
            {agendaItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No agenda items yet. Click "Add Item" to get started.</p>
            ) : (
              <div className="space-y-4">
                {agendaItems.map((item, index) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-24">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => updateAgendaItem(item.id, 'time', e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateAgendaItem(item.id, 'title', e.target.value)}
                        placeholder="Session title"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateAgendaItem(item.id, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Speakers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Featured Speakers</h2>
              <button
                type="button"
                onClick={addSpeaker}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Speaker
              </button>
            </div>
            
            {speakers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No speakers added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map(speaker => (
                  <div key={speaker.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {speaker.image_url ? (
                          <img src={speaker.image_url} alt={speaker.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(speaker.id, 'name', e.target.value)}
                          placeholder="Speaker name"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={speaker.company}
                          onChange={(e) => updateSpeaker(speaker.id, 'company', e.target.value)}
                          placeholder="Company"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={speaker.location || ''}
                          onChange={(e) => updateSpeaker(speaker.id, 'location', e.target.value)}
                          placeholder="Location"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="url"
                          value={speaker.image_url || ''}
                          onChange={(e) => updateSpeaker(speaker.id, 'image_url', e.target.value)}
                          placeholder="Image URL"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpeaker(speaker.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded h-fit"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Visitors Will Gain */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">What Event Visitors Will Gain</h2>
              <button
                type="button"
                onClick={addVisitorGain}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Item
              </button>
            </div>
            
            {visitorGains.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {visitorGains.map((gain, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={gain}
                      onChange={(e) => updateVisitorGain(index, e.target.value)}
                      placeholder="e.g., Networking opportunities with industry leaders"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeVisitorGain(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status & Submit */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {submitting ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </AppLayout>
  );
};

export default EventFormPage;
