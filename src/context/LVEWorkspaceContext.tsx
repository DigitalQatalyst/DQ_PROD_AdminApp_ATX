import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

export interface LVEWorkspaceSessionState {
  activeTabId: string;
  openRecordIds: string[];
  isPopPaneCollapsed: boolean;
}

type WorkspaceStateUpdater =
  | LVEWorkspaceSessionState
  | ((prev: LVEWorkspaceSessionState) => LVEWorkspaceSessionState);

interface LVEWorkspaceStreamOption {
  id: string;
  label: string;
}

interface LVEWorkspaceContextType {
  currentTenantId: string;
  currentTenantLabel: string;
  currentStreamId: string;
  currentStreamLabel: string;
  streamOptions: LVEWorkspaceStreamOption[];
  setCurrentStreamId: (streamId: string) => void;
  getModuleWorkspaceState: (moduleId: string) => LVEWorkspaceSessionState;
  setModuleWorkspaceState: (
    moduleId: string,
    updater: WorkspaceStateUpdater,
  ) => void;
  clearModuleWorkspaceState: (moduleId: string) => void;
}

const STORAGE_KEY = "atx:lve-workspace-sessions";
const STREAM_STORAGE_KEY = "atx:lve-current-stream";

const streamOptions: LVEWorkspaceStreamOption[] = [
  { id: "default-stream", label: "Default Stream" },
  { id: "crm-stream", label: "CRM Stream" },
  { id: "operations-stream", label: "Operations Stream" },
];

const defaultWorkspaceSessionState = (): LVEWorkspaceSessionState => ({
  activeTabId: "module-root",
  openRecordIds: [],
  isPopPaneCollapsed: false,
});

const LVEWorkspaceContext = createContext<LVEWorkspaceContextType | undefined>(
  undefined,
);

const loadStoredWorkspaceSessions = (): Record<string, LVEWorkspaceSessionState> => {
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

const loadStoredStreamId = () => {
  if (typeof window === "undefined") {
    return streamOptions[0].id;
  }

  return window.localStorage.getItem(STREAM_STORAGE_KEY) ?? streamOptions[0].id;
};

const toScopedModuleKey = (
  tenantId: string,
  streamId: string,
  moduleId: string,
) => `${tenantId}::${streamId}::${moduleId}`;

export const LVEWorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [workspaceSessions, setWorkspaceSessions] = useState<
    Record<string, LVEWorkspaceSessionState>
  >(() => loadStoredWorkspaceSessions());
  const [currentStreamId, setCurrentStreamId] = useState<string>(() =>
    loadStoredStreamId(),
  );

  const currentTenantId = user?.organization_id || user?.id || "default-tenant";
  const currentTenantLabel = user?.organization_id || "ATX Organization";
  const currentStreamLabel =
    streamOptions.find((option) => option.id === currentStreamId)?.label ??
    streamOptions[0].label;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaceSessions));
  }, [workspaceSessions]);

  useEffect(() => {
    window.localStorage.setItem(STREAM_STORAGE_KEY, currentStreamId);
  }, [currentStreamId]);

  const value = useMemo<LVEWorkspaceContextType>(
    () => ({
      currentTenantId,
      currentTenantLabel,
      currentStreamId,
      currentStreamLabel,
      streamOptions,
      setCurrentStreamId,
      getModuleWorkspaceState: (moduleId) => {
        const scopedModuleKey = toScopedModuleKey(
          currentTenantId,
          currentStreamId,
          moduleId,
        );

        return workspaceSessions[scopedModuleKey] ?? defaultWorkspaceSessionState();
      },
      setModuleWorkspaceState: (moduleId, updater) => {
        const scopedModuleKey = toScopedModuleKey(
          currentTenantId,
          currentStreamId,
          moduleId,
        );

        setWorkspaceSessions((prev) => {
          const previousState =
            prev[scopedModuleKey] ?? defaultWorkspaceSessionState();
          const nextState =
            typeof updater === "function" ? updater(previousState) : updater;

          return {
            ...prev,
            [scopedModuleKey]: nextState,
          };
        });
      },
      clearModuleWorkspaceState: (moduleId) => {
        const scopedModuleKey = toScopedModuleKey(
          currentTenantId,
          currentStreamId,
          moduleId,
        );

        setWorkspaceSessions((prev) => {
          if (!(scopedModuleKey in prev)) {
            return prev;
          }

          const nextState = { ...prev };
          delete nextState[scopedModuleKey];
          return nextState;
        });
      },
    }),
    [
      currentStreamId,
      currentStreamLabel,
      currentTenantId,
      currentTenantLabel,
      workspaceSessions,
    ],
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
