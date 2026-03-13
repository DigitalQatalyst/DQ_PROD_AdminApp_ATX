import { useEffect } from "react";

export function useAutoScrollToBottom(args: {
  deps: unknown[];
  endRef: React.RefObject<HTMLDivElement>;
}) {
  const { deps, endRef } = args;

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

