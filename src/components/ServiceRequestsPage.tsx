import React, { useEffect, useState } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, SearchIcon, ChevronDownIcon, CalendarIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon, FileTextIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseClient } from '../lib/dbClient';

interface ServiceFormSubmission {
    id: string;
    form_id: string;
    service_id: string;
    submission_data: Record<string, any>;
    submitted_by: string;
    submitted_at: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'archived';
    organization_id: string | null;
    reviewed_at?: string;
    reviewed_by?: string;
    review_notes?: string;
    // Joined fields
    service_name?: string;
    form_name?: string;
    submitter_name?: string;
    submitter_email?: string;
}

export const ServiceRequestsPage: React.FC = () => {
    const { user, userSegment, isLoading: authLoading } = useAuth();

    // State management
    const [submissions, setSubmissions] = useState<ServiceFormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<ServiceFormSubmission | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Load submissions based on user role
    useEffect(() => {
        const loadSubmissions = async () => {
            if (authLoading || !user) return;

            setLoading(true);
            try {
                const supabase = getSupabaseClient();
                if (!supabase) {
                    throw new Error('Supabase client not available');
                }

                let query = supabase
                    .from('mktplc_service_form_submissions')
                    .select(`
            *,
            mktplc_services(title, organization_id),
            mktplc_service_forms(name)
          `)
                    .order('submitted_at', { ascending: false });

                // Role-based filtering
                if (userSegment === 'customer') {
                    // Enterprise users see only their own submissions
                    query = query.eq('submitted_by', user.id);
                } else if (userSegment === 'partner') {
                    // Partners see submissions for services they own
                    // Filter by their organization_id through the service
                    query = query.eq('mktplc_services.organization_id', user.organization_id);
                }
                // Admin (internal) sees all - no additional filter

                const { data, error: fetchError } = await query;

                if (fetchError) throw fetchError;

                // Map the data to include joined fields
                const mappedData = (data || []).map((item: any) => ({
                    ...item,
                    service_name: item.mktplc_services?.title || 'Unknown Service',
                    form_name: item.mktplc_service_forms?.name || 'Unknown Form',
                }));

                setSubmissions(mappedData);
            } catch (err) {
                console.error('Error loading submissions:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadSubmissions();
    }, [authLoading, user, userSegment]);

    // Summary data calculation
    const summaryData = [
        {
            id: 'pending',
            title: 'Pending',
            count: submissions.filter(s => s.status === 'pending').length,
            icon: ClockIcon,
            color: 'bg-amber-100 text-amber-600',
            borderColor: 'border-amber-200'
        },
        {
            id: 'approved',
            title: 'Approved',
            count: submissions.filter(s => s.status === 'approved').length,
            icon: CheckCircleIcon,
            color: 'bg-green-100 text-green-600',
            borderColor: 'border-green-200'
        },
        {
            id: 'rejected',
            title: 'Rejected',
            count: submissions.filter(s => s.status === 'rejected').length,
            icon: XCircleIcon,
            color: 'bg-red-100 text-red-600',
            borderColor: 'border-red-200'
        },
        {
            id: 'reviewed',
            title: 'Under Review',
            count: submissions.filter(s => s.status === 'reviewed').length,
            icon: FileTextIcon,
            color: 'bg-blue-100 text-blue-600',
            borderColor: 'border-blue-200'
        }
    ];

    // Filter submissions
    const filteredSubmissions = submissions.filter(submission => {
        // Status filter
        if (statusFilter !== 'All' && submission.status !== statusFilter.toLowerCase()) return false;

        // Date range filter
        if (dateRange.startDate && dateRange.endDate) {
            const submittedDate = new Date(submission.submitted_at);
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (submittedDate < startDate || submittedDate > endDate) return false;
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                submission.service_name?.toLowerCase().includes(query) ||
                submission.form_name?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredSubmissions.length);
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render status badge
    const renderStatus = (status: string) => {
        const statusStyles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-800 border border-amber-200',
            approved: 'bg-green-100 text-green-800 border border-green-200',
            rejected: 'bg-red-100 text-red-800 border border-red-200',
            reviewed: 'bg-blue-100 text-blue-800 border border-blue-200',
            archived: 'bg-gray-100 text-gray-800 border border-gray-200'
        };
        return (
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    // View submission details
    const handleViewDetails = (submission: ServiceFormSubmission) => {
        setSelectedSubmission(submission);
        setReviewNotes(submission.review_notes || '');
        setIsDetailModalOpen(true);
    };

    // Handle status update
    const handleStatusUpdate = async (newStatus: ServiceFormSubmission['status']) => {
        if (!selectedSubmission || !user) return;

        setActionLoading(true);
        try {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase client not available');

            const updates = {
                status: newStatus,
                review_notes: reviewNotes,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString()
            };

            const { error: updateError } = await supabase
                .from('mktplc_service_form_submissions')
                .update(updates)
                .eq('id', selectedSubmission.id);

            if (updateError) throw updateError;

            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmission.id
                    ? { ...s, ...updates }
                    : s
            ));

            // Close modal on success
            setIsDetailModalOpen(false);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    // Clear filters
    const handleClearFilters = () => {
        setStatusFilter('All');
        setSearchQuery('');
        setDateRange({ startDate: '', endDate: '' });
        setCurrentPage(1);
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading service requests...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center">
                    <div className="mx-auto mb-3 bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <AlertCircleIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load service requests</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {error.message || 'An error occurred while loading service requests.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
                            Service Requests
                        </h1>
                        <p className="text-sm text-gray-500 text-center sm:text-left">
                            {userSegment === 'internal'
                                ? 'View all service form submissions across the platform.'
                                : userSegment === 'partner'
                                    ? 'View submissions for services you provide.'
                                    : 'Track the status of your service requests.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {summaryData.map(item => (
                    <div key={item.id} className="rounded-xl shadow-sm border border-gray-100 bg-white px-3 py-4 hover:shadow-md transition-all duration-200 ease-in-out">
                        <div className="flex items-center">
                            <div className={`p-2.5 rounded-full ${item.color} mr-3`}>
                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="text-[13px] text-gray-600 font-medium">{item.title}</h3>
                                <p className="text-lg sm:text-xl font-semibold text-gray-900">{item.count}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="sticky top-[3.5rem] bg-gray-50 z-20 pb-2">
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-xs"
                                placeholder="Search by service or form name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Chips */}
                        <div className="flex overflow-x-auto gap-3 px-1 pb-2 scrollbar-hide">
                            <div className="min-w-[140px] relative">
                                <select
                                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Reviewed">Under Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDownIcon className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <button
                                    className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                    onClick={() => setShowDateFilter(!showDateFilter)}
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Date Range</span>
                                </button>
                            </div>

                            {(statusFilter !== 'All' || dateRange.startDate || searchQuery) && (
                                <div className="flex-shrink-0">
                                    <button
                                        className="h-full inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        onClick={handleClearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    {showDateFilter && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={dateRange.startDate}
                                        onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={dateRange.endDate}
                                        onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors duration-150"
                                    onClick={() => setShowDateFilter(false)}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Table - Desktop */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 hidden md:block mt-2">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Submissions</h2>
                        {filteredSubmissions.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                                Showing {startIndex + 1}-{endIndex} of {filteredSubmissions.length} requests
                            </p>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                                    Service
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                                    Form
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                                    Submitted
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="relative px-4 py-3 w-16">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paginatedSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No service requests found
                                    </td>
                                </tr>
                            ) : (
                                paginatedSubmissions.map(submission => (
                                    <tr
                                        key={submission.id}
                                        className="hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <td className="px-4 py-3 text-[13px] font-medium text-gray-900">
                                            {submission.service_name}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-gray-700">
                                            {submission.form_name}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-gray-700">
                                            {formatDate(submission.submitted_at)}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-gray-700">
                                            {renderStatus(submission.status)}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-right">
                                            <button
                                                onClick={() => handleViewDetails(submission)}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 mt-2">
                {paginatedSubmissions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <p className="text-gray-500">No service requests found</p>
                    </div>
                ) : (
                    paginatedSubmissions.map(submission => (
                        <div
                            key={submission.id}
                            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-900 leading-snug pr-2">
                                    {submission.service_name}
                                </h3>
                                {renderStatus(submission.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-[12px] mb-3">
                                <div>
                                    <span className="text-gray-500">Form:</span>{' '}
                                    <span className="font-medium">{submission.form_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Submitted:</span>{' '}
                                    <span className="font-medium">{formatDate(submission.submitted_at)}</span>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => handleViewDetails(submission)}
                                    className="text-blue-600 text-[12px] font-medium flex items-center"
                                >
                                    View Details
                                    <ChevronRightIcon className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {filteredSubmissions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mt-4 flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <label htmlFor="rows-per-page" className="text-[12px] sm:text-sm text-gray-600 mr-2">
                            Rows per page:
                        </label>
                        <select
                            id="rows-per-page"
                            className="border border-gray-300 rounded-md text-[12px] sm:text-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={rowsPerPage}
                            onChange={e => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <span className="text-[12px] sm:text-sm text-gray-700">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDetailModalOpen(false)}></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Submission Details
                                    </h3>
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Service & Form Info */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Service</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedSubmission.service_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Form</p>
                                                <p className="text-sm font-medium text-gray-900">{selectedSubmission.form_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(selectedSubmission.submitted_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                                {renderStatus(selectedSubmission.status)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Notes - Visible to all, editable by reviewers if not customer */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Review Notes</h4>
                                        <textarea
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            rows={3}
                                            value={reviewNotes}
                                            onChange={e => setReviewNotes(e.target.value)}
                                            placeholder={userSegment === 'customer' ? 'No review notes available' : 'Add review notes here...'}
                                            readOnly={userSegment === 'customer'}
                                            disabled={actionLoading}
                                        />
                                    </div>

                                    {/* Submission Data */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Form Responses</h4>
                                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            {Object.entries(selectedSubmission.submission_data || {}).map(([key, value]) => (
                                                <div key={key} className="px-4 py-3">
                                                    <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm text-gray-900 text-wrap break-words">
                                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                    </p>
                                                </div>
                                            ))}
                                            {Object.keys(selectedSubmission.submission_data || {}).length === 0 && (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                    No form data available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Close
                                </button>

                                {userSegment !== 'customer' && (
                                    <>
                                        {selectedSubmission.status !== 'approved' && (
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                                                onClick={() => handleStatusUpdate('approved')}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Updating...' : 'Approve'}
                                            </button>
                                        )}
                                        {selectedSubmission.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                                                onClick={() => handleStatusUpdate('rejected')}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Updating...' : 'Reject'}
                                            </button>
                                        )}
                                        {selectedSubmission.status !== 'reviewed' && selectedSubmission.status !== 'approved' && selectedSubmission.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                                                onClick={() => handleStatusUpdate('reviewed')}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Updating...' : 'Mark as Reviewing'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredSubmissions.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center mt-2">
                    <div className="mx-auto max-w-md">
                        <div className="bg-gray-100 p-4 sm:p-6 rounded-full inline-flex items-center justify-center mb-4">
                            <FileTextIcon className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                            No service requests found
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {submissions.length === 0
                                ? 'There are no service requests to display.'
                                : 'Try adjusting your filters to find what you\'re looking for.'}
                        </p>
                        {(statusFilter !== 'All' || dateRange.startDate || searchQuery) && (
                            <button
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                onClick={handleClearFilters}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
