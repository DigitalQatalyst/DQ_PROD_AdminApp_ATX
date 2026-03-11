import React from "react";
import { FlagIcon } from "lucide-react";

export function CustomReportModal({
  isOpen,
  customReportModalRef,
  customReportReason,
  setCustomReportReason,
  onCancel,
  onSubmit,
}: {
  isOpen: boolean;
  customReportModalRef: React.RefObject<HTMLDivElement>;
  customReportReason: string;
  setCustomReportReason: (reason: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={customReportModalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-5"
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Report Conversation
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Please provide details about why you're reporting this conversation.
          </p>
        </div>
        <div className="mb-4">
          <label
            htmlFor="reportReason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason
          </label>
          <textarea
            id="reportReason"
            rows={4}
            placeholder="Please describe the issue..."
            value={customReportReason}
            onChange={(e) => setCustomReportReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!customReportReason.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm flex items-center ${
              customReportReason.trim()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            <FlagIcon size={16} className="mr-2" />
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

