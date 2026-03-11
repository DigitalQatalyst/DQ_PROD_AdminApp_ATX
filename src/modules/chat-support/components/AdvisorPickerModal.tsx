import React from "react";
import { XIcon } from "lucide-react";
import type { AdvisorUser } from "../services/ChatSupportService";

export function AdvisorPickerModal({
  isOpen,
  advisors,
  isCreatingConversation,
  onClose,
  onStartConversation,
}: {
  isOpen: boolean;
  advisors: AdvisorUser[];
  isCreatingConversation: boolean;
  onClose: () => void;
  onStartConversation: (advisor: AdvisorUser | null) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col mx-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Choose an advisor
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {advisors.length === 0 ? (
            <p className="text-sm text-gray-500">
              No advisors available for your organization.
            </p>
          ) : (
            advisors.map((advisor) => (
              <button
                key={advisor.id}
                onClick={() => onStartConversation(advisor)}
                disabled={isCreatingConversation}
                className={`w-full text-left border border-gray-200 rounded-md p-3 hover:bg-gray-50 ${
                  isCreatingConversation ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    {advisor.username?.[0]?.toUpperCase() ||
                      advisor.email?.[0]?.toUpperCase() ||
                      "A"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {advisor.username || "Advisor"}
                    </p>
                    <p className="text-xs text-gray-500">{advisor.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onStartConversation(advisors[0] || null)}
            disabled={advisors.length === 0 || isCreatingConversation}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              advisors.length === 0 || isCreatingConversation
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCreatingConversation
              ? "Starting..."
              : advisors.length === 0
                ? "No advisors available"
                : "Start with first available"}
          </button>
        </div>
      </div>
    </div>
  );
}

