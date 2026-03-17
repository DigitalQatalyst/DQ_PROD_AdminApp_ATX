import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleEllipsis, Eye, Plus, RefreshCw } from "lucide-react";
import {
  LVEWorkspaceAction,
  LVEWorkspaceLayout,
  LVETab,
} from "./LVEWorkspaceLayout";
import {
  MockWorkspaceModuleData,
  MockWorkspaceRecord,
  mockWorkspaceModuleTabs,
} from "./mock/lveShellMockData";
import { cn } from "../../utils/cn";
import Button from "../ui/ButtonComponent";
import { useLVEWorkspace } from "../../context/LVEWorkspaceContext";

interface MockLVEWorkspacePageProps {
  module: MockWorkspaceModuleData;
}

const RECORD_TAB_PREFIX = "record:";
const DEFAULT_WORKSPACE_STATE = {
  activeTabId: "module-root",
  openRecordIds: [],
};

const toRecordTabId = (recordId: string) => `${RECORD_TAB_PREFIX}${recordId}`;
const toRecordIdFromTabId = (tabId: string) =>
  tabId.startsWith(RECORD_TAB_PREFIX)
    ? tabId.slice(RECORD_TAB_PREFIX.length)
    : undefined;

const getRecordStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (["active", "customer", "qualified"].includes(normalizedStatus)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (["prospect", "contacted", "partner"].includes(normalizedStatus)) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-200";
  }

  if (["inactive", "delete", "closed"].includes(normalizedStatus)) {
    return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }

  if (["opportunity"].includes(normalizedStatus)) {
    return "border-sky-500/20 bg-sky-500/10 text-sky-300";
  }

  return "border-border bg-muted/50 text-muted-foreground";
};

export function MockLVEWorkspacePage({
  module,
}: MockLVEWorkspacePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setModuleWorkspaceState, workspaceSessions } = useLVEWorkspace();
  const moduleWorkspaceState =
    workspaceSessions[module.moduleId] ?? DEFAULT_WORKSPACE_STATE;
  const availableRecordIds = useMemo(
    () => new Set(module.records.map((record) => record.id)),
    [module.records],
  );
  const openRecordIds = useMemo(
    () =>
      moduleWorkspaceState.openRecordIds.filter((recordId) =>
        availableRecordIds.has(recordId),
      ),
    [availableRecordIds, moduleWorkspaceState.openRecordIds],
  );
  const activeRecordIdFromState = toRecordIdFromTabId(moduleWorkspaceState.activeTabId);
  const activeTabId =
    moduleWorkspaceState.activeTabId === "module-root" ||
    (activeRecordIdFromState !== undefined &&
      availableRecordIds.has(activeRecordIdFromState))
      ? moduleWorkspaceState.activeTabId
      : "module-root";
  const storedOpenRecordIdsKey = moduleWorkspaceState.openRecordIds.join("|");
  const openRecordIdsKey = openRecordIds.join("|");

  useEffect(() => {
    const needsCleanup =
      openRecordIdsKey !== storedOpenRecordIdsKey ||
      activeTabId !== moduleWorkspaceState.activeTabId;

    if (!needsCleanup) {
      return;
    }

    setModuleWorkspaceState(module.moduleId, {
      openRecordIds,
      activeTabId,
    });
  }, [
    activeTabId,
    module.moduleId,
    moduleWorkspaceState.activeTabId,
    openRecordIdsKey,
    openRecordIds,
    setModuleWorkspaceState,
    storedOpenRecordIdsKey,
  ]);

  const activeRecordId = activeTabId.startsWith(RECORD_TAB_PREFIX)
    ? toRecordIdFromTabId(activeTabId)
    : undefined;

  const activeRecord = useMemo(
    () => module.records.find((record) => record.id === activeRecordId),
    [activeRecordId, module.records],
  );

  const tabs: LVETab[] = [
    {
      id: "module-root",
      label: module.rootTabLabel,
      isActive: activeTabId === "module-root",
      canClose: false,
    },
    ...openRecordIds
      .map((recordId) => module.records.find((record) => record.id === recordId))
      .filter((record): record is MockWorkspaceRecord => Boolean(record))
      .map((record) => ({
        id: toRecordTabId(record.id),
        label: record.title,
        isActive: activeTabId === toRecordTabId(record.id),
        canClose: true,
      })),
  ];
  const moduleTabs: LVETab[] = mockWorkspaceModuleTabs.map((moduleTab) => ({
    id: moduleTab.id,
    label: moduleTab.label,
    isActive: location.pathname === moduleTab.path,
    canClose: false,
  }));

  const handleRecordOpen = (record: MockWorkspaceRecord) => {
    setModuleWorkspaceState(module.moduleId, (prev) => ({
      openRecordIds: prev.openRecordIds.includes(record.id)
        ? prev.openRecordIds
        : [...prev.openRecordIds, record.id],
      activeTabId: toRecordTabId(record.id),
    }));
  };

  const handleTabSelect = (tabId: string) => {
    setModuleWorkspaceState(module.moduleId, (prev) => ({
      ...prev,
      activeTabId: tabId,
    }));
  };

  const handleModuleTabSelect = (tabId: string) => {
    const targetModule = mockWorkspaceModuleTabs.find(
      (moduleTab) => moduleTab.id === tabId,
    );

    if (!targetModule || targetModule.path === location.pathname) {
      return;
    }

    navigate(targetModule.path);
  };

  const handleTabClose = (tabId: string) => {
    const recordId = tabId.replace(RECORD_TAB_PREFIX, "");

    setModuleWorkspaceState(module.moduleId, (prev) => ({
      openRecordIds: prev.openRecordIds.filter((id) => id !== recordId),
      activeTabId: prev.activeTabId === tabId ? "module-root" : prev.activeTabId,
    }));
  };

  const moduleActions: LVEWorkspaceAction[] = module.moduleActions.map(
    (action) => ({
      ...action,
      onClick: () => {
        console.log(`${module.moduleId}:${action.id}`);
      },
    }),
  );

  const recordActions: LVEWorkspaceAction[] = activeRecord
    ? module.recordActions.map((action) => ({
        ...action,
        onClick: () => {
          console.log(`${module.moduleId}:${activeRecord.id}:${action.id}`);
        },
      }))
    : [];

  const workHeaderActions = activeRecord
    ? recordActions
    : [];

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-1">
      <LVEWorkspaceLayout
        headerTitle={module.headerTitle}
        headerDescription={module.headerDescription}
        headerActions={moduleActions}
        moduleTabs={moduleTabs}
        onModuleTabSelect={handleModuleTabSelect}
        tabs={tabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        listHeader={{
          eyebrow: "Queue",
          title: module.queueTitle,
          meta: (
            <span className="text-[11px] text-muted-foreground">
              {module.records.length} records
            </span>
          ),
        }}
        listPane={
          <div className="space-y-2 p-3">
            {module.records.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => handleRecordOpen(record)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                  activeRecord?.id === record.id
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-background hover:bg-secondary/40",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {record.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {record.subtitle}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    getRecordStatusClassName(record.status),
                  )}
                >
                  {record.status}
                </span>
              </button>
            ))}
          </div>
        }
        workHeader={{
          eyebrow: "Work Window",
          title: module.workspaceTitle,
          subtitle: activeRecord
            ? activeRecord.title
            : module.workspaceSubtitle,
          meta: activeRecord ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                {activeRecord.summary}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Last updated {activeRecord.lastUpdated}
              </div>
            </div>
          ) : undefined,
          actions: workHeaderActions,
        }}
        workPane={
          activeRecord ? (
            <div className="space-y-4 p-4">
              {activeRecord.detailSections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.label}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {field.label}
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 py-8">
              <div className="max-w-md text-center">
                <Eye className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {module.workspaceTitle}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a record to open a workspace tab.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 border-border bg-background hover:bg-secondary hover:text-foreground"
                  onClick={() => handleRecordOpen(module.records[0])}
                >
                  <Plus className="h-4 w-4" />
                  Open first record
                </Button>
              </div>
            </div>
          )
        }
        popHeader={{
          eyebrow: "Context",
          title: module.contextTitle,
          subtitle: activeRecord ? module.contextSubtitle : undefined,
        }}
        popPane={
          activeRecord ? (
            <div className="space-y-3 p-4">
              {activeRecord.contextCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <div className="mt-3 space-y-3">
                    {card.items.map((item) => (
                      <div key={`${card.id}-${item.label}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <div className="max-w-xs text-center">
                <CircleEllipsis className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Select a record.</p>
              </div>
            </div>
          )
        }
        footer={`${module.moduleId} mock shell ready for API integration`}
      />
    </div>
  );
}
