import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  FileText, 
  Settings, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  ArrowRight,
  MessageSquare,
  Edit3,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../../components/ui/ButtonComponent';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ServiceRequest, ServiceRequestActivity } from '../types';
import { ServiceRequestApi } from '../../../api/services/serviceRequestApi';

type TabId = 'overview' | 'activity' | 'resolution' | 'related';

interface ServiceRequestDetailProps {
  request: ServiceRequest;
  onEdit: () => void;
  onEscalate: () => void;
  onClose: () => void;
  onRefresh: () => void;
}

export const ServiceRequestDetail: React.FC<ServiceRequestDetailProps> = ({
  request,
  onEdit,
  onEscalate,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activities, setActivities] = useState<ServiceRequestActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const data = await ServiceRequestApi.listActivities(request.id);
        setActivities(data);
      } catch (error) {
        console.error('[Services] Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [request.id]);

  const isClosed = request.status === 'closed';

  const renderOverview = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailField label="Type" value={request.type} icon={<Settings className="h-4 w-4" />} />
        <DetailField 
            label="Priority" 
            value={request.priority} 
            icon={<AlertTriangle className="h-4 w-4" />} 
            customValue={
                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase ${
                    request.priority === 'low' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    request.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    request.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {request.priority}
                </span>
            }
        />
        <DetailField 
            label="Status" 
            value={request.status} 
            icon={<Shield className="h-4 w-4" />} 
            customValue={<StatusBadge status={request.status.replace('_', ' ')} />}
        />
        <DetailField label="Owner" value={request.owner_name || null} icon={<User className="h-4 w-4" />} />
        <DetailField label="Created" value={format(new Date(request.created_at), 'PPP p')} icon={<Clock className="h-4 w-4" />} />
        <DetailField label="SLA Due" value={request.sla_due_at ? format(new Date(request.sla_due_at), 'PPP p') : 'None'} icon={<Clock className="h-4 w-4 text-orange-400" />} />
      </div>
      
      {request.description && (
        <div className="border-t pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
        </div>
      )}

      {request.is_automated_trigger && (
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Automated Trigger</span>
          </div>
          <p className="text-xs text-purple-600 mb-2">This request was triggered by an automated system monitoring event.</p>
          <div className="text-sm font-medium text-purple-800">
            Recurrence Count: <span className={request.recurrence_count >= 3 ? "text-red-600 font-bold" : ""}>{request.recurrence_count}</span>
            {request.recurrence_count >= 2 && request.recurrence_count < 3 && (
                <span className="ml-2 text-[10px] text-orange-600 italic">This issue has recurred {request.recurrence_count} times. Consider escalating.</span>
            )}
            {request.recurrence_count >= 3 && (
                <span className="ml-2 text-[10px] text-red-600 font-bold italic">Critical recurrence detected!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity Timeline</h4>
        <Button size="sm" variant="outline" onClick={() => onRefresh()}>
          <Clock className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>
      
      {loadingActivities ? (
        <p className="text-xs text-gray-400 italic">Loading timeline...</p>
      ) : activities.length > 0 ? (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex items-start group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm z-10 shrink-0 mr-4">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 pt-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-900 capitalize">{activity.type.replace('_', ' ')}</span>
                  <time className="text-[10px] text-gray-400">{format(new Date(activity.created_at), 'MMM d, p')}</time>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {activity.creator_name && (
                  <div className="mt-1 flex items-center text-[10px] text-gray-400 italic">
                    <User className="h-2.5 w-2.5 mr-1" />
                    {activity.creator_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 center py-12 italic border rounded-lg border-dashed">No activities logged yet.</p>
      )}
    </div>
  );

  const renderResolution = () => (
    <div className="p-6">
      {request.status === 'resolved' || request.status === 'closed' ? (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-800">Resolution Published</h4>
              <p className="text-xs text-emerald-700 mt-1">This request has been fulfilled or resolved.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resolution Summary</h4>
              <div className="p-4 bg-gray-50 border rounded-lg text-sm text-gray-700 italic">
                {request.resolution_summary || 'No summary provided.'}
              </div>
            </div>
            
            {request.lessons_learned && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lessons Learned</h4>
                <div className="p-4 bg-blue-50/30 border border-blue-50 rounded-lg text-sm text-gray-700">
                  {request.lessons_learned}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <h3 className="text-sm font-medium text-gray-500 italic">This request is still in progress.</h3>
            <p className="text-xs text-gray-400 mt-1">Resolution details will appear here once resolved.</p>
        </div>
      )}
    </div>
  );

  const renderRelated = () => (
    <div className="p-6 space-y-4">
      {request.account_id ? (
        <RelatedCard title="Account" name={request.account_name || 'Linked Account'} icon={<Building2 className="h-4 w-4" />} />
      ) : null}
      {request.contact_id ? (
        <RelatedCard title="Contact" name={request.contact_name || 'Linked Contact'} icon={<User className="h-4 w-4" />} />
      ) : null}
      {!request.account_id && !request.contact_id && (
          <p className="text-sm text-gray-500 italic center py-12 border rounded-lg border-dashed">No related records linked.</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Detail Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{request.type}</span>
              <StatusBadge status={request.status.replace('_', ' ')} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{request.title}</h2>
          </div>
          
          <div className="flex gap-2">
            {!isClosed && (
                <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                {request.status !== 'escalated' && (
                    <Button variant="outline" size="sm" onClick={onEscalate} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Escalate
                    </Button>
                )}
                {request.status === 'resolved' && (
                    <Button variant="primary" size="sm" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Close
                    </Button>
                )}
                </>
            )}
            {isClosed && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 text-xs font-semibold">
                    <XCircle className="h-4 w-4 mr-1.5" /> CLOSED / READ-ONLY
                </div>
            )}
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex gap-1 mt-6 border-b border-gray-100 -mb-px">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors uppercase tracking-wider ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
                {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'activity' && renderActivity()}
        {activeTab === 'resolution' && renderResolution()}
        {activeTab === 'related' && renderRelated()}
      </div>
    </div>
  );
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 'activity', label: 'Activity', icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'resolution', label: 'Resolution', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { id: 'related', label: 'Related', icon: <Building2 className="h-3.5 w-3.5" /> },
];

const DetailField: React.FC<{ label: string; value: string | null; icon: React.ReactNode; customValue?: React.ReactNode }> = ({ label, value, icon, customValue }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm transition-hover hover:border-blue-100">
    <div className="mt-0.5 text-gray-400 group-hover:text-blue-500">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      {customValue ? (
          <div className="mt-1">{customValue}</div>
      ) : (
          <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{value || '—'}</p>
      )}
    </div>
  </div>
);

const RelatedCard: React.FC<{ title: string; name: string; icon: React.ReactNode }> = ({ title, name, icon }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-200 transition-colors group">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-md">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
      </div>
    </div>
    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
  </div>
);

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'status_change': return <RefreshCircle className="h-5 w-5 text-blue-500" />;
    case 'note': return <MessageSquare className="h-5 w-5 text-gray-500" />;
    case 'escalation': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'resolution': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'system_trigger': return <Settings className="h-5 w-5 text-purple-500" />;
    default: return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const RefreshCircle: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);
