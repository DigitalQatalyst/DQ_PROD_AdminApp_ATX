import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import Button from '../../../components/ui/ButtonComponent';

const allTags = [
  'DCO Assessment', 'AI Strategy', 'DTMI Licensing', 'Digital Transformation',
  'Cloud Migration', 'Data Analytics', 'Enterprise Client', 'Government',
  'High Priority', 'Budget Approved', 'Decision Maker', 'Q1 Target',
];

interface OpportunityTagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const OpportunityTagManager: React.FC<OpportunityTagManagerProps> = ({ tags, onAddTag, onRemoveTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddTag(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    }
  };

  const filteredSuggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="pl-2 pr-1 py-1 gap-1 text-sm font-normal bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {isAdding ? (
        <div className="relative flex items-center">
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            onBlur={() => setTimeout(() => setIsAdding(false), 200)}
            className="h-7 w-40 text-xs px-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add tag..."
          />
          {inputValue && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  onMouseDown={() => { onAddTag(suggestion); setInputValue(''); setIsAdding(false); }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-7 px-2 text-xs text-gray-500 hover:text-orange-500"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Tag
        </Button>
      )}
    </div>
  );
};
