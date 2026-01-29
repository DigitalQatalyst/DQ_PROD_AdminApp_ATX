import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, SearchIcon, FilterIcon, EyeIcon, EditIcon, TrashIcon, 
  CheckCircleIcon, XCircleIcon, ClockIcon, ArchiveIcon, ChevronDownIcon,
  FileTextIcon, VideoIcon, MicIcon, BookOpenIcon, NewspaperIcon, FileIcon,
  DownloadIcon, TrendingUpIcon, StarIcon
} from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';
import { AppLayout } from './AppLayout';

export interface Content {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  media_type: string;
  business_stage?: string | string[];
  category?: string | string[];
  popularity_tag?: string;
  body_html?: string;
  body_json?: any;
  resource_url?: string;
  video_url?: string;
  podcast_url?: string;
  thumbnail_url?: string;
  file_type?: string;
  file_size_mb?: number;
  provider_id?: string | null;
  provider_name?: string;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Rejected' | 'Archived';
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  published_at?: string;
  view_count?: number;
  download_count?: number;
  like_count?: number;
  tags?: string[];
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  organization_id?: string;
}

// Filter options
const MEDIA_TYPES = ['All', 'News', 'Article', 'Reports', 'Toolkits & Templates', 'Guides', 'Videos', 'Podcasts'];
const BUSINESS_STAGES = ['All', 'Ideation', 'Launch', 'Growth', 'Expansion', 'Optimization', 'Transformation'];
const CATEGORIES = ['All', 'Quick Reads', 'In-Depth Reports', 'Interactive Tools', 'Downloadable Templates', 'Recorded Media', 'Live Events'];
const STATUSES = ['All', 'Draft', 'Pending Review', 'Published', 'Rejected', 'Archived'];
const POPULARITY_TAGS = ['All', 'Latest', 'Trending', 'Most Downloaded', 'Editors Pick'];

export const ContentManagementPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { user, userSegment, isLoading: authLoading } = useAuth();
  const { data: contents, loading, error, list, update, remove } = useCRUD<Content>('contents');

  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessStageFilter, setBusinessStageFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!authLoading) {
      list();
    }
  }, [authLoading, list]);

  // Helper to ensure array format (handles both array and legacy string data)
  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val) return [val];
    return [];
  };

  // Filter contents
  const filteredContents = (contents || []).filter(content => {
    if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (mediaTypeFilter !== 'All' && content.media_type !== mediaTypeFilter) return false;
    if (statusFilter !== 'All' && content.status !== statusFilter) return false;
    // Handle business_stage as array
    if (businessStageFilter !== 'All') {
      const stages = ensureArray(content.business_stage);
      if (!stages.includes(businessStageFilter)) return false;
    }
    // Handle category as array
    if (categoryFilter !== 'All') {
      const categories = ensureArray(content.category);
      if (!categories.includes(categoryFilter)) return false;
    }
    return true;
  });

  // Summary counts
  const summaryData = [
    { id: 'draft', label: 'Drafts', count: contents?.filter(c => c.status === 'Draft').length || 0, color: 'bg-gray-100 text-gray-800', icon: FileTextIcon },
    { id: 'pending', label: 'Pending Review', count: contents?.filter(c => c.status === 'Pending Review').length || 0, color: 'bg-amber-100 text-amber-800', icon: ClockIcon },
    { id: 'published', label: 'Published', count: contents?.filter(c => c.status === 'Published').length || 0, color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    { id: 'rejected', label: 'Rejected', count: contents?.filter(c => c.status === 'Rejected').length || 0, color: 'bg-red-100 text-red-800', icon: XCircleIcon },
  ];

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'News': return <NewspaperIcon className="h-4 w-4" />;
      case 'Article': return <FileTextIcon className="h-4 w-4" />;
      case 'Reports': return <FileIcon className="h-4 w-4" />;
      case 'Toolkits & Templates': return <DownloadIcon className="h-4 w-4" />;
      case 'Guides': return <BookOpenIcon className="h-4 w-4" />;
      case 'Videos': return <VideoIcon className="h-4 w-4" />;
      case 'Podcasts': return <MicIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Pending Review': return 'bg-amber-100 text-amber-800';
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await remove(id);
      setToast({ type: 'success', message: 'Content deleted successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete content' });
    }
  };

  const handleSubmitForReview = async (content: Content) => {
    try {
      await update(content.id, { 
        status: 'Pending Review', 
        submitted_at: new Date().toISOString() 
      });
      await list();
      setToast({ type: 'success', message: 'Content submitted for review' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to submit for review' });
    }
  };

  const handleReview = async () => {
    if (!selectedContent) return;
    try {
      const updateData: Partial<Content> = {
        status: reviewAction === 'approve' ? 'Published' : 'Rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      };
      if (reviewAction === 'approve') {
        updateData.published_at = new Date().toISOString();
      }
      await update(selectedContent.id, updateData);
      await list();
      setShowReviewModal(false);
      setSelectedContent(null);
      setReviewNotes('');
      setToast({ type: 'success', message: `Content ${reviewAction === 'approve' ? 'approved and published' : 'rejected'}` });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to review content' });
    }
  };

  const openReviewModal = (content: Content, action: 'approve' | 'reject') => {
    setSelectedContent(content);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  if (authLoading || loading) {
    return (
      <AppLayout activeSection="content-management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeSection="content-management">
      <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-sm text-gray-500">Create and manage articles, guides, videos, and more</p>
            </div>
            <Can I="create" a="Content">
              <button
                onClick={() => navigate('/content-form-new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Create Content
              </button>
            </Can>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryData.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xl font-semibold">{item.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-3">
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {MEDIA_TYPES.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
                ))}
              </select>

              <select
                value={businessStageFilter}
                onChange={(e) => setBusinessStageFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {BUSINESS_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage === 'All' ? 'All Stages' : stage}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No content found. Create your first content to get started.
                    </td>
                  </tr>
                ) : (
                  filteredContents.map(content => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {content.thumbnail_url && (
                            <img src={content.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{content.title}</p>
                            {content.provider_name && (
                              <p className="text-xs text-gray-500">by {content.provider_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                          {getMediaTypeIcon(content.media_type)}
                          {content.media_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {content.provider_name || 'Internal'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(content.status)}`}>
                          {content.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ensureArray(content.business_stage).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(content.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Submit for Review - only for drafts by partners */}
                          {content.status === 'Draft' && userSegment === 'partner' && (
                            <button
                              onClick={() => handleSubmitForReview(content)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                              title="Submit for Review"
                            >
                              <ClockIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Approve/Reject - only for pending review by admins */}
                          {content.status === 'Pending Review' && userSegment === 'internal' && (
                            <>
                              <button
                                onClick={() => openReviewModal(content, 'approve')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openReviewModal(content, 'reject')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => navigate(`/content-form-new/${content.id}`)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          
                          <Can I="delete" a="Content">
                            <button
                              onClick={() => handleDelete(content.id, content.title)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {reviewAction === 'approve' ? 'Approve Content' : 'Reject Content'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {reviewAction === 'approve' 
                  ? `Are you sure you want to approve and publish "${selectedContent.title}"?`
                  : `Are you sure you want to reject "${selectedContent.title}"?`
                }
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {reviewAction === 'approve' ? 'Notes (optional)' : 'Reason for rejection'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={reviewAction === 'approve' ? 'Add any notes...' : 'Please provide a reason...'}
                  required={reviewAction === 'reject'}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={reviewAction === 'reject' && !reviewNotes.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    reviewAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {reviewAction === 'approve' ? 'Approve & Publish' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </AppLayout>
  );
};

export default ContentManagementPageNew;
