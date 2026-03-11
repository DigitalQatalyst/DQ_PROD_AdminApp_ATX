import React, { useState, createElement } from 'react';
import {
    FileIcon,
    FileTextIcon,
    ImageIcon,
    FileSpreadsheetIcon,
    DownloadIcon,
    CheckIcon,
    LoaderIcon,
    ExternalLinkIcon,
} from 'lucide-react';
import { FileAttachment as FileAttachmentType } from './types';
interface FileAttachmentProps {
    file: FileAttachmentType;
    isOutgoing: boolean;
}
export function FileAttachment({ file, isOutgoing }: FileAttachmentProps) {
    const [downloadStatus, setDownloadStatus] = useState<
        'idle' | 'downloading' | 'downloaded'
    >('idle');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return (
                    <FileTextIcon
                        size={16}
                        className={isOutgoing ? 'text-blue-200' : 'text-red-500'}
                    />
                );
            case 'image':
                return (
                    <ImageIcon
                        size={16}
                        className={isOutgoing ? 'text-blue-200' : 'text-blue-500'}
                    />
                );
            case 'spreadsheet':
                return (
                    <FileSpreadsheetIcon
                        size={16}
                        className={isOutgoing ? 'text-blue-200' : 'text-green-500'}
                    />
                );
            default:
                return (
                    <FileIcon
                        size={16}
                        className={isOutgoing ? 'text-blue-200' : 'text-gray-500'}
                    />
                );
        }
    };
    const handleDownload = () => {
        if (!file.url) return;
        setDownloadStatus('downloading');
        // Start download by creating an anchor element
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name || 'download';
        document.body.appendChild(link);
        // Simulate download progress
        const interval = setInterval(() => {
            setDownloadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setDownloadStatus('downloaded');
                        // Reset after showing the downloaded state
                        setTimeout(() => {
                            setDownloadStatus('idle');
                            setDownloadProgress(0);
                        }, 2000);
                    }, 200);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
        // Trigger the download
        link.click();
        document.body.removeChild(link);
    };
    const isLink =
        file.url &&
        (file.url.startsWith('http://') || file.url.startsWith('https://'));
    const openLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLink) {
            window.open(file.url, '_blank', 'noopener,noreferrer');
        }
    };
    return (
        <div
            className={`flex items-center p-2 rounded-md ${isOutgoing ? 'bg-blue-700' : 'bg-gray-100'}`}
        >
            {getFileIcon(file.type)}
            <div className="ml-2 flex-1 min-w-0">
                <p
                    className={`text-sm font-medium truncate ${isOutgoing ? 'text-white' : 'text-gray-700'} ${isLink ? 'cursor-pointer hover:underline' : ''}`}
                    onClick={isLink ? openLink : undefined}
                >
                    {file.name}
                    {isLink && <ExternalLinkIcon size={12} className="inline ml-1" />}
                </p>
                <p
                    className={`text-xs ${isOutgoing ? 'text-blue-200' : 'text-gray-500'}`}
                >
                    {file.size}
                </p>
            </div>
            <button
                onClick={handleDownload}
                disabled={downloadStatus !== 'idle'}
                className={`ml-2 p-1 rounded-full ${isOutgoing ? 'text-white hover:bg-blue-800' : 'text-blue-600 hover:bg-gray-200'} ${downloadStatus !== 'idle' ? 'cursor-default' : 'cursor-pointer'}`}
            >
                {downloadStatus === 'idle' && <DownloadIcon size={16} />}
                {downloadStatus === 'downloading' && (
                    <div className="relative w-4 h-4">
                        <LoaderIcon size={16} className="animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                            {downloadProgress}%
                        </div>
                    </div>
                )}
                {downloadStatus === 'downloaded' && (
                    <CheckIcon size={16} className="text-green-500" />
                )}
            </button>
        </div>
    );
}
