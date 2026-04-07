import React, { useState } from "react";
import {
  LVEWorkspaceLayout,
  LVETab,
} from "../components/layout/LVEWorkspaceLayout";

import { ServiceRequestList } from "../modules/services/components/ServiceRequestList";
import { ServiceRequestDetail } from "../modules/services/components/ServiceRequestDetail";
import { ServiceRequestForm } from "../modules/services/components/ServiceRequestForm";
import { QuickCreateServiceDialog } from "../modules/services/components/QuickCreateServiceDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Toast } from "../components/ui/Toast";
import { useServiceManagement } from "../modules/services/hooks/useServiceManagement";

const defaultTabs: LVETab[] = [
  {
    id: "services-home",
    label: "Service Management",
    isActive: true,
  },
];

const ServicesPage: React.FC = () => {
  const {
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
  } = useServiceManagement();

  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");

  const handleQuickCreated = () => {
    setToast({ type: "success", message: "Service request created successfully" });
    fetchServiceRequests();
    setShowQuickCreate(false);
  };

  const onEscalateConfirm = async () => {
    await handleEscalate(escalateReason);
    setShowEscalateConfirm(false);
    setEscalateReason("");
  };

  const onCloseConfirm = async () => {
    await handleClose(resolutionSummary, lessonsLearned);
    setShowCloseConfirm(false);
    setResolutionSummary("");
    setLessonsLearned("");
  };

  return (
    <div className="h-full">
      <LVEWorkspaceLayout
        headerTitle="Service Management"
        tenantLabel="DQ ATX Blueprint"
        streamLabel="Operations Stream"
        tabs={defaultTabs}
        menuPane={
          <div className="p-4 space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground text-[11px] tracking-wide uppercase">
              Service Actions
            </div>
            <ul className="space-y-1">
              <li
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => fetchServiceRequests()}
              >
                All Requests
              </li>
              <li
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => setShowQuickCreate(true)}
              >
                Quick Create
              </li>
            </ul>
          </div>
        }
        listPane={
          <ServiceRequestList
            requests={serviceRequests}
            loading={loading}
            filters={filters}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setMode("view");
            }}
            onFiltersChange={setFilters}
            onNew={() => setShowQuickCreate(true)}
          />
        }
        workPane={
          <div className="h-full">
            {selectedRequest ? (
              mode === "edit" ? (
                <ServiceRequestForm
                  mode="edit"
                  defaultValues={selectedRequest}
                  onSuccess={handleSave}
                  onCancel={() => setMode("view")}
                  isLoading={saving}
                />
              ) : (
                <ServiceRequestDetail
                  request={selectedRequest}
                  onEdit={() => setMode("edit")}
                  onEscalate={() => setShowEscalateConfirm(true)}
                  onClose={() => setShowCloseConfirm(true)}
                  onRefresh={fetchServiceRequests}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
                <p>Select a service request to view details</p>
              </div>
            )}
          </div>
        }
        footer={
          <span>Service Management — Enterprise Operations Layer</span>
        }
      />

      <QuickCreateServiceDialog
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        onCreated={handleQuickCreated}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showEscalateConfirm}
        onClose={() => setShowEscalateConfirm(false)}
        onConfirm={onEscalateConfirm}
        title="Escalate Service Request"
        confirmLabel="Escalate"
        confirmVariant="danger"
        message={
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">Please provide a reason for escalating this request.</p>
            <textarea
              className="w-full px-3 py-2 border rounded-md text-sm h-24 outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Reason for escalation..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>
        }
      />

      <ConfirmDialog
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={onCloseConfirm}
        title="Close Service Request"
        confirmLabel="Confirm Close"
        confirmVariant="primary"
        message={
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">Provide resolution details before closing.</p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Resolution Summary *</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm h-20 outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="What was done?"
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Lessons Learned</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm h-20 outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Any future preventions?"
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
              />
            </div>
          </div>
        }
      />

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

export default ServicesPage;
