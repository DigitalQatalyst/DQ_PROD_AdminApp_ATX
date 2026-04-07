import React, { useState } from 'react';
import Button from "../../../components/ui/ButtonComponent";
import { ServiceRequestType, ServiceRequestPriority } from "../types";
import { createServiceRequest } from "../actions";

interface QuickCreateServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (request: any) => void;
}

export const QuickCreateServiceDialog: React.FC<QuickCreateServiceDialogProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ServiceRequestType>('request');
  const [priority, setPriority] = useState<ServiceRequestPriority>('medium');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await createServiceRequest({
        title,
        type,
        priority,
        account_id: accountId || undefined,
      });

      if (err) {
        setError(err);
      } else {
        onCreated(data);
        setTitle('');
        setAccountId('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
          <div className="bg-white px-6 pt-6 pb-4">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Quick Create Service Request
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Title*</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Brief summary of request"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Type*</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    disabled={loading}
                  >
                    <option value="incident">Incident</option>
                    <option value="change">Change</option>
                    <option value="request">Request</option>
                    <option value="problem">Problem</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Priority*</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Account (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Account UUID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-2">
            <Button variant="default" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Create Request"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto mt-2 sm:mt-0">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
