/**
 * ContactCard Component
 *
 * Individual contact card displayed in the list pane.
 */

import React from 'react';
import { Mail, Calendar } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors duration-150 ${isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
        }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {contact.first_name} {contact.last_name}
          </h4>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
          {contact.title && (
            <p className="mt-1 text-xs text-gray-400 truncate">
              {contact.title}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end ml-2 flex-shrink-0">
          <Badge
            variant={contact.status === 'active' ? 'success' : 'secondary'}
            className="text-[10px] px-2 py-0.5"
          >
            {contact.status}
          </Badge>
          <div className="flex items-center mt-2 text-[10px] text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(contact.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
