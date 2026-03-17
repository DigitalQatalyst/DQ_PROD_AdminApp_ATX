import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface LVEWorkspaceSessionState {
  activeTabId: string;
  openRecordIds: string[];
}

type WorkspaceStateUpdater =
  | LVEWorkspaceSessionState
  | ((prev: LVEWorkspaceSessionState) => LVEWorkspaceSessionState);

interface LVEWorkspaceContextType {
  workspaceSessions: Record<string, LVEWorkspaceSessionState>;
  setModuleWorkspaceState: (
    moduleId: string,
    updater: WorkspaceStateUpdater,
  ) => void;
  clearModuleWorkspaceState: (moduleId: string) => void;
}

const STORAGE_KEY = "atx:lve-workspace-sessions";

const defaultWorkspaceSessionState = (): LVEWorkspaceSessionState => ({
  activeTabId: "module-root",
  openRecordIds: [],
});

const LVEWorkspaceContext = createContext<LVEWorkspaceContextType | undefined>(
  undefined,
);

const loadStoredWorkspaceSessions = (): Record<
  string,
  LVEWorkspaceSessionState
> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as Record<string, LVEWorkspaceSessionState>;
    return parsed ?? {};
  } catch (error) {
    console.error("Failed to load LVE workspace sessions", error);
    return {};
  }
};

export const LVEWorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [workspaceSessions, setWorkspaceSessions] = useState<
    Record<string, LVEWorkspaceSessionState>
  >(() => loadStoredWorkspaceSessions());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceSessions));
  }, [workspaceSessions]);

  const value = useMemo<LVEWorkspaceContextType>(
    () => ({
      workspaceSessions,
      setModuleWorkspaceState: (moduleId, updater) => {
        setWorkspaceSessions((prev) => {
          const previousState = prev[moduleId] ?? defaultWorkspaceSessionState();
          const nextState =
            typeof updater === "function"
              ? updater(previousState)
              : updater;

          return {
            ...prev,
            [moduleId]: nextState,
          };
        });
      },
      clearModuleWorkspaceState: (moduleId) => {
        setWorkspaceSessions((prev) => {
          if (!(moduleId in prev)) {
            return prev;
          }

          const nextState = { ...prev };
          delete nextState[moduleId];
          return nextState;
        });
      },
    }),
    [workspaceSessions],
  );

  return (
    <LVEWorkspaceContext.Provider value={value}>
      {children}
    </LVEWorkspaceContext.Provider>
  );
};

export const useLVEWorkspace = () => {
  const context = useContext(LVEWorkspaceContext);

  if (!context) {
    throw new Error("useLVEWorkspace must be used within an LVEWorkspaceProvider");
  }

  return context;
};
