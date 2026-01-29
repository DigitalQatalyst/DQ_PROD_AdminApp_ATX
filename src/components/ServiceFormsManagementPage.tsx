import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  EditIcon, 
  EyeIcon, 
  TrashIcon, 
  SearchIcon, 
  FilterIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import { useCRUD } from '../hooks/useCRUD';
import { useAuth } from '../context/AuthContext';
import { ServiceForm, Service } from '../types';
import { Toast } from './ui/Toast';
import { Can } from './auth/Can';

export const ServiceFormsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();
  const { 
    data: forms, 
    loading, 
    error, 
    list, 
    remove,
    refresh 
  } = useCRUD<ServiceForm>('mktplc_service_forms');
  
  const { data: services, list: listServices } = useCRUD<Service>('mktplc_services');

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);

  // Load data (after auth is ready)
  useEffect(() => {
    if (!authLoading) {
      list();
      listServices();
    }
  }, [authLoading]);

  // Filter forms
  const filteredForms = forms?.filter(form => {
    const formName = form.name || '';
    const formDesc = form.description || '';
    const formActive = form.isActive ?? form.is_active ?? true;
    const formServiceId = form.serviceId || form.service_id || '';
    
    const matchesSearch = !searchQuery || 
      formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formDesc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && formActive) ||
      (statusFilter === 'inactive' && !formActive);
    
    const matchesService = serviceFilter === 'all' || formServiceId === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  }) || [];

  // Get service name by ID
  const getServiceName = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    return service?.title || service?.name || 'Unknown Service';
  };

  // Handle delete
  const handleDelete = async (formId: string) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await remove(formId);
      setToast({ type: 'success', message: 'Form deleted successfully' });
      refresh();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete form' });
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (form: ServiceForm) => {
    try {
      // This would require an update method - for now just show a message
      setToast({ type: 'info', message: 'Toggle functionality coming soon' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to update form' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Forms</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage dynamic forms for services
          </p>
        </div>
        <Can I="create" a="service-form">
          <button
            onClick={() => navigate('/service-form-builder/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon size={20} />
            Create Form
          </button>
        </Can>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="relative">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Services</option>
              {services?.map(service => (
                <option key={service.id} value={service.id}>
                  {service.title || service.name || 'Untitled Service'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredForms.length === 0 ? (
          <div className="p-12 text-center">
            <FileTextIcon className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No forms found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first service form'}
            </p>
            {!searchQuery && statusFilter === 'all' && serviceFilter === 'all' && (
              <Can I="create" a="service-form">
                <button
                  onClick={() => navigate('/service-form-builder/new')}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Form
                </button>
              </Can>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map((form) => {
                  const formActive = form.isActive ?? form.is_active ?? true;
                  const formServiceId = form.serviceId || form.service_id || '';
                  const formCreatedAt = form.createdAt || form.created_at || '';
                  
                  return (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileTextIcon className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{form.name}</div>
                          {form.description && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {form.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getServiceName(formServiceId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {form.fields?.length || 0} fields
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {formActive ? (
                          <>
                            <CheckCircleIcon className="mr-1" size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="mr-1" size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formCreatedAt ? new Date(formCreatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Can I="read" a="service-form">
                          <button
                            onClick={() => navigate(`/service-form-builder/${form.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon size={18} />
                          </button>
                        </Can>
                        <Can I="update" a="service-form">
                          <button
                            onClick={() => navigate(`/service-form-builder/${form.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <EditIcon size={18} />
                          </button>
                        </Can>
                        <Can I="delete" a="service-form">
                          <button
                            onClick={() => handleDelete(form.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};


