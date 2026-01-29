import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, UploadIcon, LinkIcon, ImageIcon } from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { Toast } from './ui/Toast';
import { AppLayout } from './AppLayout';
import type { Content } from './ContentManagementPageNew';

// Options
const MEDIA_TYPES = ['News', 'Article', 'Reports', 'Toolkits & Templates', 'Guides', 'Videos', 'Podcasts'];
const BUSINESS_STAGES = ['Ideation', 'Launch', 'Growth', 'Expansion', 'Optimization', 'Transformation'];
const CATEGORIES = ['Quick Reads', 'In-Depth Reports', 'Interactive Tools', 'Downloadable Templates', 'Recorded Media', 'Live Events'];
const POPULARITY_TAGS = ['Latest', 'Trending', 'Most Downloaded', 'Editors Pick'];

// Media types that need resource URL (downloadable)
const DOWNLOADABLE_TYPES = ['Reports', 'Toolkits & Templates', 'Guides'];
// Media types that need video URL
const VIDEO_TYPES = ['Videos'];
// Media types that need podcast URL
const PODCAST_TYPES = ['Podcasts'];
// Media types that need body content
const BODY_TYPES = ['News', 'Article'];

export const ContentFormPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const isEditMode = !!contentId;
  const { user, userSegment, isLoading: authLoading } = useAuth();
  
  // Get partners for provider dropdown
  const { data: partners, list: listPartners } = useCRUD<any>('partners');
  const { getById, create, update } = useCRUD<Content>('contents');
  
  // Load partners on mount
  useEffect(() => {
    if (!authLoading) {
      listPartners();
    }
  }, [authLoading]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Content>>({
    title: '',
    slug: '',
    summary: '',
    media_type: 'Article',
    business_stage: [] as string[],
    category: [] as string[],
    popularity_tag: '',
    body_html: '',
    resource_url: '',
    video_url: '',
    podcast_url: '',
    thumbnail_url: '',
    file_type: '',
    file_size_mb: undefined,
    provider_id: null,
    provider_name: 'Qatar Development Bank', // Default internal provider
    tags: [],
    status: 'Draft',
  });

  const [tagsInput, setTagsInput] = useState('');

  // Load content if editing
  useEffect(() => {
    const loadContent = async () => {
      if (!isEditMode) return;
      setLoading(true);
      try {
        const content = await getById(contentId);
        if (content) {
          // Ensure array format (handles both array and legacy string data)
          const ensureArray = (val: any): string[] => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val) return [val];
            return [];
          };
          
          setFormData({
            ...content,
            tags: content.tags || [],
            business_stage: ensureArray(content.business_stage),
            category: ensureArray(content.category),
            provider_id: content.provider_id || null,
          });
          setTagsInput((content.tags || []).join(', '));
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load content' });
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [contentId, isEditMode, getById]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditMode && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditMode]);

  // Update provider_name when provider_id changes
  useEffect(() => {
    if (formData.provider_id && partners) {
      const partner = partners.find(p => p.id === formData.provider_id);
      if (partner) {
        setFormData(prev => ({ ...prev, provider_name: partner.name }));
      }
    } else if (!formData.provider_id) {
      setFormData(prev => ({ ...prev, provider_name: '' }));
    }
  }, [formData.provider_id, partners]);

  const handleChange = (field: keyof Content, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = true) => {
    e.preventDefault();
    
    if (!formData.title || !formData.media_type) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const contentData: Partial<Content> = {
        ...formData,
        // Convert empty string to undefined for UUID field
        provider_id: formData.provider_id || undefined,
        // Send arrays directly - Supabase handles TEXT[] conversion
        business_stage: formData.business_stage || [],
        category: formData.category || [],
        status: saveAsDraft ? 'Draft' : (userSegment === 'internal' ? 'Published' : 'Pending Review'),
      };

      // Set published_at if publishing directly (admin only)
      if (!saveAsDraft && userSegment === 'internal') {
        contentData.published_at = new Date().toISOString();
      }

      // Set submitted_at if submitting for review (partner)
      if (!saveAsDraft && userSegment === 'partner') {
        contentData.submitted_at = new Date().toISOString();
      }

      if (isEditMode) {
        await update(contentId, contentData);
        setToast({ type: 'success', message: 'Content updated successfully' });
      } else {
        await create(contentData);
        setToast({ type: 'success', message: saveAsDraft ? 'Content saved as draft' : 'Content submitted successfully' });
      }
      
      setTimeout(() => navigate('/content-management'), 1500);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save content' });
    } finally {
      setSubmitting(false);
    }
  };

  const needsResourceUrl = DOWNLOADABLE_TYPES.includes(formData.media_type || '');
  const needsVideoUrl = VIDEO_TYPES.includes(formData.media_type || '');
  const needsPodcastUrl = PODCAST_TYPES.includes(formData.media_type || '');
  const needsBodyContent = BODY_TYPES.includes(formData.media_type || '');

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
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/content-management')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Content' : 'Create Content'}
            </h1>
            <p className="text-sm text-gray-500">Fill in the content details below</p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                <select
                  value={formData.media_type}
                  onChange={(e) => handleChange('media_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {MEDIA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary of the content"
                />
              </div>
            </div>
          </div>

          {/* Content Body - for Articles and News */}
          {needsBodyContent && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Content Body</h2>
              <textarea
                value={formData.body_html}
                onChange={(e) => handleChange('body_html', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Enter HTML content or plain text..."
              />
            </div>
          )}

          {/* Resource URL - for downloadable content */}
          {needsResourceUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Resource File</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.resource_url}
                      onChange={(e) => handleChange('resource_url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://... or upload file"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">URL to the downloadable file (PDF, DOCX, etc.)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                  <input
                    type="text"
                    value={formData.file_type}
                    onChange={(e) => handleChange('file_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., PDF, DOCX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size (MB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.file_size_mb || ''}
                    onChange={(e) => handleChange('file_size_mb', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video URL */}
          {needsVideoUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Video</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="YouTube, Vimeo, or direct video URL"
                />
                <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, or direct video file URLs</p>
              </div>
            </div>
          )}

          {/* Podcast URL */}
          {needsPodcastUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Podcast</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Podcast URL *</label>
                <input
                  type="url"
                  value={formData.podcast_url}
                  onChange={(e) => handleChange('podcast_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Spotify, Apple Podcasts, or direct audio URL"
                />
                <p className="text-xs text-gray-500 mt-1">Supports Spotify, Apple Podcasts, or direct audio file URLs</p>
              </div>
            </div>
          )}

          {/* Categorization */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Categorization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Format (select multiple)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.category as string[] || []).includes(cat)}
                        onChange={(e) => {
                          const current = formData.category as string[] || [];
                          if (e.target.checked) {
                            handleChange('category', [...current, cat]);
                          } else {
                            handleChange('category', current.filter(c => c !== cat));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Popularity Tag</label>
                <select
                  value={formData.popularity_tag}
                  onChange={(e) => handleChange('popularity_tag', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {POPULARITY_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider (Partner)</label>
                <select
                  value={formData.provider_id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value || null;
                    handleChange('provider_id', selectedId);
                    // Set provider_name based on selection
                    if (selectedId) {
                      const partner = partners?.find(p => p.id === selectedId);
                      handleChange('provider_name', partner?.name || '');
                    } else {
                      // Internal = Qatar Development Bank
                      handleChange('provider_name', 'Qatar Development Bank');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Qatar Development Bank (Internal)</option>
                  {partners?.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the partner providing this content</p>
              </div>

              {formData.provider_name && (
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Selected Provider:</p>
                    <p className="text-sm text-blue-600">{formData.provider_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Thumbnail</h2>
            <div className="flex gap-4 items-start">
              {formData.thumbnail_url && (
                <img src={formData.thumbnail_url} alt="Thumbnail" className="w-32 h-20 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {userSegment === 'partner' && (
                  <p>Content will be submitted for admin review before publishing.</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/content-management')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, false)}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {userSegment === 'internal' ? 'Publish' : 'Submit for Review'}
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

export default ContentFormPageNew;
