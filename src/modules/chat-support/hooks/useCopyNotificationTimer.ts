import { useEffect } from "react";

export function useCopyNotificationTimer(args: {
  showCopyNotification: boolean;
  setShowCopyNotification: (show: boolean) => void;
}) {
  const { showCopyNotification, setShowCopyNotification } = args;

  // Hide copy notification after 2 seconds
  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification, setShowCopyNotification]);
}

