import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
    ServiceRequest, 
    ServiceRequestFilters 
} from '../types';
import { 
    updateServiceRequest, 
    escalateServiceRequest, 
    closeServiceRequest 
} from '../actions';
import { ServiceRequestApi } from '../../../api/services/serviceRequestApi';

export function useServiceManagement() {
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [saving, setSaving] = useState(false);
    const [filters, setFilters] = useState<ServiceRequestFilters>({
        search: '',
        status: 'all',
        type: 'all',
        priority: 'all',
        ownerId: '',
    });
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchServiceRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ServiceRequestApi.listServiceRequests();
            setServiceRequests(data);
        } catch (error) {
            console.error("[Services] Error fetching service requests:", error);
            setToast({ type: 'error', message: "Failed to load service requests" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServiceRequests();
    }, [fetchServiceRequests]);

    const selectedRequest = useMemo(() => 
        serviceRequests.find(r => r.id === selectedId) || null
    , [serviceRequests, selectedId]);

    const handleSave = async (data: any) => {
        if (!selectedId) return;
        setSaving(true);
        try {
            const { error } = await updateServiceRequest(
                selectedId, 
                data, 
                selectedRequest?.status
            );
            if (error) {
                setToast({ type: 'error', message: error });
            } else {
                setToast({ type: 'success', message: 'Service request updated successfully' });
                setMode('view');
                fetchServiceRequests();
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEscalate = async (reason: string) => {
        if (!selectedId || !reason) return;
        setSaving(true);
        try {
            const { error } = await escalateServiceRequest(
                selectedId, 
                reason, 
                selectedRequest?.recurrence_count || 0
            );
            if (error) {
                setToast({ type: 'error', message: error });
            } else {
                setToast({ type: 'success', message: 'Request escalated successfully' });
                fetchServiceRequests();
            }
        } finally {
            setSaving(false);
        }
    };

    const handleClose = async (summary: string, lessons: string) => {
        if (!selectedId || !summary) return;
        setSaving(true);
        try {
            const { error } = await closeServiceRequest(
                selectedId, 
                summary, 
                lessons
            );
            if (error) {
                setToast({ type: 'error', message: error });
            } else {
                setToast({ type: 'success', message: 'Request closed successfully' });
                fetchServiceRequests();
            }
        } finally {
            setSaving(false);
        }
    };

    // Auto-escalation logic
    useEffect(() => {
        if (selectedRequest && selectedRequest.recurrence_count >= 3 && selectedRequest.status !== 'escalated') {
            const autoEscalate = async () => {
                const { error } = await escalateServiceRequest(
                    selectedRequest.id, 
                    'Auto-escalated due to high recurrence count (>= 3)', 
                    selectedRequest.recurrence_count
                );
                if (!error) fetchServiceRequests();
            };
            autoEscalate();
        }
    }, [selectedRequest, fetchServiceRequests]);

    return {
        serviceRequests,
        loading,
        selectedId,
        selectedRequest,
        mode,
        saving,
        filters,
        toast,
        setSelectedId,
        setMode,
        setFilters,
        setToast,
        fetchServiceRequests,
        handleSave,
        handleEscalate,
        handleClose,
    };
}
