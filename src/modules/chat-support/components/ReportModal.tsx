import React, { useState } from 'react';
import { XIcon, FileTextIcon, SendIcon } from 'lucide-react';
interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export function ReportModal({ isOpen, onClose }: ReportModalProps) {
    const [reportType, setReportType] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
            // Reset form after showing success message
            setTimeout(() => {
                setDescription('');
                setReportType('');
                setSubmitted(false);
                onClose();
            }, 2000);
        }, 1000);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FileTextIcon className="mr-2 text-blue-600" size={20} />
                        Submit a Report
                    </h2>
                    <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <XIcon size={20} className="text-gray-500" />
                    </button>
                </div>
                {/* Content */}
                <div className="p-6">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Report Submitted
                            </h3>
                            <p className="text-gray-600">
                                Thank you for your feedback. We'll review your report shortly.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Report Type
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select a report type</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="service">Service Quality</option>
                                    <option value="feedback">General Feedback</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="suggestion">Suggestion</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32"
                                    placeholder="Please provide details about your report..."
                                    required
                                ></textarea>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon size={16} className="mr-2" />
                                            Submit Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
