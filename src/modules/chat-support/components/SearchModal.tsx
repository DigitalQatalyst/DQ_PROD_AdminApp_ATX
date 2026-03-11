import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronUpIcon, ChevronDownIcon, XIcon } from "lucide-react";
import type { Message } from "../types";

export function SearchModal({
  isOpen,
  searchModalRef,
  messages,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  onClose,
}: {
  isOpen: boolean;
  searchModalRef: React.RefObject<HTMLDivElement>;
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: Message[];
  setSearchResults: (results: Message[]) => void;
  onClose: () => void;
}) {
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const previousSearchQueryRef = useRef(searchQuery);
  const previousResultsRef = useRef<string[]>([]);
  const currentHighlightedRef = useRef<string | null>(null);

  // Memoize search results to prevent recalculation on every message update
  const computedSearchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, messages]);

  // Update search results only when they actually change
  useEffect(() => {
    const currentResultIds = computedSearchResults.map((r) => r.id).join(",");
    const previousResultIds = previousResultsRef.current.join(",");

    // Only update if:
    // 1. Search query changed
    // 2. Result IDs changed (new/deleted messages matching the search)
    const queryChanged = previousSearchQueryRef.current !== searchQuery;
    const resultsChanged = currentResultIds !== previousResultIds;

    if (queryChanged || resultsChanged) {
      setSearchResults(computedSearchResults);
      previousResultsRef.current = computedSearchResults.map((r) => r.id);

      // Only reset to first result if the search query changed
      if (queryChanged) {
        setCurrentResultIndex(0);

        // Scroll to first result
        if (computedSearchResults.length > 0) {
          scrollToMessage(computedSearchResults[0].id);
        }
      }

      previousSearchQueryRef.current = searchQuery;
    }
  }, [searchQuery, computedSearchResults, setSearchResults]);

  const removeHighlight = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.classList.remove("bg-yellow-100");
    }
  };

  const scrollToMessage = (messageId: string) => {
    // Remove previous highlight if exists
    if (currentHighlightedRef.current) {
      removeHighlight(currentHighlightedRef.current);
    }

    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Highlight the message and keep it highlighted
        element.classList.add("bg-yellow-100");
        currentHighlightedRef.current = messageId;
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (searchResults.length === 0) return;
    const newIndex =
      currentResultIndex > 0
        ? currentResultIndex - 1
        : searchResults.length - 1;
    setCurrentResultIndex(newIndex);
    scrollToMessage(searchResults[newIndex].id);
  };

  const handleNext = () => {
    if (searchResults.length === 0) return;
    const newIndex =
      currentResultIndex < searchResults.length - 1
        ? currentResultIndex + 1
        : 0;
    setCurrentResultIndex(newIndex);
    scrollToMessage(searchResults[newIndex].id);
  };

  const handleClose = () => {
    // Remove highlight from current message
    if (currentHighlightedRef.current) {
      removeHighlight(currentHighlightedRef.current);
      currentHighlightedRef.current = null;
    }

    setSearchQuery("");
    setSearchResults([]);
    setCurrentResultIndex(0);
    previousSearchQueryRef.current = "";
    previousResultsRef.current = [];
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={searchModalRef}
      className="absolute top-0 left-0 right-0 bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 z-20 flex-shrink-0"
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors"
        aria-label="Close search"
      >
        <XIcon size={20} />
      </button>

      {/* Search input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          autoFocus
        />
      </div>

      {/* Result counter */}
      {searchResults.length > 0 && (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {currentResultIndex + 1} / {searchResults.length}
        </span>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevious}
          disabled={searchResults.length === 0}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous result"
        >
          <ChevronUpIcon size={20} />
        </button>
        <button
          onClick={handleNext}
          disabled={searchResults.length === 0}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next result"
        >
          <ChevronDownIcon size={20} />
        </button>
      </div>
    </div>
  );
}

