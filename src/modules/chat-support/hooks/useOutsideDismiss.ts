import { useEffect } from "react";

export function useOutsideDismiss(args: {
  menuRef: React.RefObject<HTMLElement>;
  searchModalRef: React.RefObject<HTMLElement>;
  customReportModalRef: React.RefObject<HTMLElement>;
  isSearchOpen: boolean;
  showCustomReportModal: boolean;
  setIsMenuOpen: (open: boolean) => void;
  setShowConfirmClear: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: any[]) => void;
  setShowCustomReportModal: (open: boolean) => void;
  setCustomReportReason: (reason: string) => void;
}) {
  const {
    menuRef,
    searchModalRef,
    customReportModalRef,
    isSearchOpen,
    showCustomReportModal,
    setIsMenuOpen,
    setShowConfirmClear,
    setIsSearchOpen,
    setSearchQuery,
    setSearchResults,
    setShowCustomReportModal,
    setCustomReportReason,
  } = args;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowConfirmClear(false);
      }
      if (
        isSearchOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (
        showCustomReportModal &&
        customReportModalRef.current &&
        !customReportModalRef.current.contains(event.target as Node)
      ) {
        setShowCustomReportModal(false);
        setCustomReportReason("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    menuRef,
    searchModalRef,
    customReportModalRef,
    isSearchOpen,
    showCustomReportModal,
    setIsMenuOpen,
    setShowConfirmClear,
    setIsSearchOpen,
    setSearchQuery,
    setSearchResults,
    setShowCustomReportModal,
    setCustomReportReason,
  ]);
}

