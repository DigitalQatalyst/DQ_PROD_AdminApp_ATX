import React, { useState } from 'react';
import { Phone, Mail, FileText, RefreshCw, Calendar, CheckSquare, Send } from 'lucide-react';
import { cn } from '../../../utils/cn';
import Button from '../../../components/ui/ButtonComponent';
import { Activity, ActivityType } from '../types';

interface LeadActivityTimelineProps {
  activities: Activity[];
  onAddNote: (note: string) => void;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'call': return <Phone className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'note': return <FileText className="w-4 h-4" />;
    case 'status_change': return <RefreshCw className="w-4 h-4" />;
    case 'meeting': return <Calendar className="w-4 h-4" />;
    case 'task': return <CheckSquare className="w-4 h-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'call': return 'bg-blue-100 text-blue-600';
    case 'email': return 'bg-purple-100 text-purple-600';
    case 'note': return 'bg-yellow-100 text-yellow-600';
    case 'status_change': return 'bg-gray-100 text-gray-600';
    case 'meeting': return 'bg-green-100 text-green-600';
    case 'task': return 'bg-orange-100 text-orange-600';
  }
};

export const LeadActivityTimeline: React.FC<LeadActivityTimelineProps> = ({ activities, onAddNote }) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) { onAddNote(note); setNote(''); }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none bg-white"
            rows={3}
            placeholder="Add a note or log an activity..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" size="sm" disabled={!note.trim()} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Send className="w-3 h-3 mr-2" />
              Add Note
            </Button>
          </div>
        </form>
      </div>

      <div className="relative space-y-6 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            <div className={cn('relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-sm', getActivityColor(activity.type))}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 py-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.user}
                <span className="font-normal text-gray-500">
                  {' '}• {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
