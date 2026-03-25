import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/ButtonComponent";
import { 
  ServiceRequest, 
  ServiceRequestType, 
  ServiceRequestPriority, 
  ServiceRequestStatus,
  CreateServiceRequestInput,
  UpdateServiceRequestInput
} from "../types";

interface ServiceRequestFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<ServiceRequest>;
  onSuccess: (data: ServiceRequest) => void;
  onCancel: () => void;
  prefill?: {
    account_id?: string;
    contact_id?: string;
    lead_id?: string;
  };
  isLoading?: boolean;
}

const TYPES: { value: ServiceRequestType; label: string }[] = [
  { value: "incident", label: "Incident" },
  { value: "change", label: "Change" },
  { value: "request", label: "Request" },
  { value: "problem", label: "Problem" },
];

const PRIORITIES: { value: ServiceRequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const STATUSES: { value: ServiceRequestStatus; label: string }[] = [
  { value: "raised", label: "Raised" },
  { value: "triaged", label: "Triaged" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  mode,
  defaultValues,
  onSuccess,
  onCancel,
  prefill,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<ServiceRequest>>({
    title: "",
    description: "",
    type: "request",
    priority: "medium",
    status: "raised",
    account_id: "",
    contact_id: "",
    lead_id: "",
    owner_id: "",
    sla_due_at: "",
    ...defaultValues,
    ...prefill,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.type) newErrors.type = "Type is required";
    
    if (mode === "edit" && formData.status === "closed" && !formData.resolution_summary) {
      newErrors.resolution_summary = "Resolution summary is required when closing";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSuccess(formData as ServiceRequest);
    }
  };

  const isClosed = formData.status === "closed";

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {mode === "create" ? "Create Service Request" : "Edit Service Request"}
        </h2>
        {isClosed && (
          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
            Read-only: Closed
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isClosed || isLoading}
            placeholder="e.g., VPN Connection Issue"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isClosed || isLoading}
            placeholder="Detailed explanation of the request..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceRequestType })}
              disabled={isClosed || isLoading}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ServiceRequestPriority })}
              disabled={isClosed || isLoading}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Status (Edit mode only) */}
          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceRequestStatus })}
                disabled={isClosed || isLoading}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* SLA Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SLA Due Date</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.sla_due_at?.slice(0, 16) || ""}
              onChange={(e) => setFormData({ ...formData, sla_due_at: e.target.value })}
              disabled={isClosed || isLoading}
            />
          </div>
        </div>

        {/* Account Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 bg-opacity-50"
              value={formData.account_id || ""}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              disabled={!!prefill?.account_id || isClosed || isLoading}
              placeholder="Account UUID..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 bg-opacity-50"
              value={formData.contact_id || ""}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              disabled={!!prefill?.contact_id || isClosed || isLoading}
              placeholder="Contact UUID..."
            />
          </div>
        </div>

        {/* Resolution fields (Edit mode only) */}
        {mode === "edit" && (formData.status === "resolved" || formData.status === "closed") && (
          <div className="space-y-4 border-t pt-4 border-dashed">
            <h3 className="text-sm font-semibold text-gray-900">Resolution Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Summary *</label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 ${
                  errors.resolution_summary ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.resolution_summary || ""}
                onChange={(e) => setFormData({ ...formData, resolution_summary: e.target.value })}
                disabled={isClosed || isLoading}
                placeholder="How was this issue resolved?"
              />
              {errors.resolution_summary && <p className="mt-1 text-xs text-red-500">{errors.resolution_summary}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lessons Learned</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20"
                value={formData.lessons_learned || ""}
                onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                disabled={isClosed || isLoading}
                placeholder="Any takeaways for future prevention?"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          type="button"
        >
          Cancel
        </Button>
        {!isClosed && (
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : mode === "create" ? "Create Request" : "Save Changes"}
          </Button>
        )}
      </div>
    </form>
  );
};
