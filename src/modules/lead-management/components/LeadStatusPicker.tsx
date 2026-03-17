import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { LeadStatus } from '../types';

interface LeadStatusPickerProps {
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
}

const statuses: LeadStatus[] = ['New', 'Qualified', 'Contacted', 'Proposal Sent', 'Converted', 'Lost'];

const statusConfig: Record<LeadStatus, { dot: string; bg: string; text: string }> = {
  New: { dot: 'bg-blue-500', bg: 'hover:bg-blue-50', text: 'text-blue-700' },
  Qualified: { dot: 'bg-purple-500', bg: 'hover:bg-purple-50', text: 'text-purple-700' },
  Contacted: { dot: 'bg-yellow-500', bg: 'hover:bg-yellow-50', text: 'text-yellow-700' },
  'Proposal Sent': { dot: 'bg-orange-500', bg: 'hover:bg-orange-50', text: 'text-orange-700' },
  Converted: { dot: 'bg-green-500', bg: 'hover:bg-green-50', text: 'text-green-700' },
  Lost: { dot: 'bg-red-500', bg: 'hover:bg-red-50', text: 'text-red-700' },
};

export const LeadStatusPicker: React.FC<LeadStatusPickerProps> = ({ currentStatus, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = statusConfig[currentStatus];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium transition-all',
          'hover:border-gray-300 hover:shadow-sm',
          open && 'border-gray-300 shadow-sm ring-2 ring-gray-100'
        )}
      >
        <span className={cn('w-2.5 h-2.5 rounded-full', current.dot)} />
        <span className={cn('flex-1 text-left', current.text)}>{currentStatus}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          {statuses.map((status) => {
            const cfg = statusConfig[status];
            const isActive = status === currentStatus;
            return (
              <button
                key={status}
                onClick={() => { onStatusChange(status); setOpen(false); }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors',
                  cfg.bg,
                  isActive ? 'bg-gray-50 font-medium' : 'text-gray-700'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                <span className="flex-1 text-left">{status}</span>
                {isActive && <Check className="w-4 h-4 text-gray-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
