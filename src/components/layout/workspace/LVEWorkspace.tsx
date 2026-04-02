import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LVEWorkspaceLayout, LVETab } from "../LVEWorkspaceLayout";
import { useLVEWorkspace } from "../../../context/LVEWorkspaceContext";
import { useAuth } from "../../../context/AuthContext";
import {
  DefaultListPane,
  DefaultPopPane,
  DefaultWorkPane,
} from "./defaultRenderers";
import { LVEDeleteModal, LVERecordFormModal } from "./LVECrudModals";
import { getLveModulesForSegment } from "./moduleRegistry";
import {
  LVEActionContext,
  LVEActionDefinition,
  LVEWorkspaceModuleConfig,
  LVEWorkspaceOverrideProps,
  LVEWorkspaceProps,
} from "./types";
import {
  buildRecordTabs,
  filterRecords,
  isModuleRootTabId,
  loadStoredModuleRecords,
  MODULE_ROOT_TAB_ID,
  RECORDS_STORAGE_KEY,
  RECORDS_VERSION_KEY,
  resolveNextOpenRecordIds,
  resolveRecordTabClose,
  resolveRouteBackedActiveTabId,
  resolveShouldPersistLocalRecords,
  resolveStoredActiveRecordId,
  toErrorMessage,
  toRecordIdFromTabId,
  toRecordTabId,
} from "./workspaceModel";

export function LVEWorkspace<TRecord>({
  module,
  records: controlledRecords,
  state,
  persistLocalRecords,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
}: LVEWorkspaceProps<TRecord>) {
  const { recordId: routeRecordId } = useParams<{ recordId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { userSegment } = useAuth();
  const {
    currentStreamId,
    currentStreamLabel,
    currentTenantId,
    currentTenantLabel,
    getModuleWorkspaceState,
    setModuleWorkspaceState,
  } = useLVEWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCrudModal, setActiveCrudModal] = useState<
    "create" | "edit" | "delete" | null
  >(null);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [isSubmittingCrud, setIsSubmittingCrud] = useState(false);

  const RECORDS_PER_PAGE = 20;

  const recordsStorageKey = `${RECORDS_STORAGE_KEY}::${currentTenantId}::${currentStreamId}::${module.metadata.id}`;
  const isControlledRecords = controlledRecords !== undefined;
  const shouldPersistLocalRecords = resolveShouldPersistLocalRecords(
    isControlledRecords,
    persistLocalRecords,
  );
  const initialRecords = useMemo(
    () =>
      isControlledRecords
        ? (controlledRecords ?? [])
        : shouldPersistLocalRecords
          ? loadStoredModuleRecords(recordsStorageKey, module.listPane.records)
          : module.listPane.records,
    [
      controlledRecords,
      isControlledRecords,
      module.listPane.records,
      recordsStorageKey,
      shouldPersistLocalRecords,
    ],
  );
  const [recordsState, setRecordsState] = useState<TRecord[]>(initialRecords);

  useEffect(() => {
    if (isControlledRecords) {
      setRecordsState(controlledRecords ?? []);
      return;
    }

    setRecordsState(
      shouldPersistLocalRecords
        ? loadStoredModuleRecords(recordsStorageKey, module.listPane.records)
        : module.listPane.records,
    );
  }, [
    controlledRecords,
    isControlledRecords,
    module.listPane.records,
    recordsStorageKey,
    shouldPersistLocalRecords,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isControlledRecords ||
      !shouldPersistLocalRecords
    ) {
      return;
    }

    window.localStorage.setItem(
      recordsStorageKey,
      JSON.stringify({
        version: RECORDS_VERSION_KEY,
        records: recordsState,
      }),
    );
  }, [
    isControlledRecords,
    recordsState,
    recordsStorageKey,
    shouldPersistLocalRecords,
  ]);

  useEffect(() => {
    setSearchQuery("");
    setActiveCrudModal(null);
    setCrudError(null);
    setIsSubmittingCrud(false);
  }, [module.metadata.id]);

  const runtimeModule = useMemo<LVEWorkspaceModuleConfig<TRecord>>(
    () => ({
      ...module,
      listPane: {
        ...module.listPane,
        ...state?.listPane,
        records: recordsState,
      },
      workWindow: {
        ...module.workWindow,
        ...state?.workWindow,
      },
      popPane: {
        ...module.popPane,
        ...state?.popPane,
      },
    }),
    [module, recordsState, state?.listPane, state?.popPane, state?.workWindow],
  );

  const sessionState = getModuleWorkspaceState(module.metadata.id);
  const recordById = useMemo(
    () =>
      Object.fromEntries(
        recordsState.map((record) => [
          runtimeModule.listPane.getRecordId(record),
          record,
        ]),
      ) as Record<string, TRecord>,
    [recordsState, runtimeModule.listPane],
  );

  useEffect(() => {
    if (runtimeModule.listPane.isLoading) {
      return;
    }

    if (routeRecordId && !recordById[routeRecordId]) {
      navigate(module.routes.base, { replace: true });
    }
  }, [
    module.routes.base,
    navigate,
    recordById,
    routeRecordId,
    runtimeModule.listPane.isLoading,
  ]);

  const openRecordIds = useMemo(
    () =>
      sessionState.openRecordIds.filter((recordId) => recordId in recordById),
    [recordById, sessionState.openRecordIds],
  );
  const resolvedStoredActiveRecordId = useMemo(
    () => resolveStoredActiveRecordId(sessionState.activeTabId, recordById),
    [recordById, sessionState.activeTabId],
  );

  useEffect(() => {
    if (runtimeModule.listPane.isLoading || routeRecordId) {
      return;
    }

    if (
      !resolvedStoredActiveRecordId ||
      location.pathname !== module.routes.base
    ) {
      return;
    }

    navigate(module.routes.record(resolvedStoredActiveRecordId), {
      replace: true,
    });
  }, [
    location.pathname,
    module.routes,
    navigate,
    resolvedStoredActiveRecordId,
    routeRecordId,
    runtimeModule.listPane.isLoading,
  ]);

  const nextOpenRecordIds = useMemo(
    () =>
      resolveNextOpenRecordIds({
        routeRecordId,
        recordById,
        openRecordIds,
      }),
    [openRecordIds, recordById, routeRecordId],
  );

  const routeBackedActiveTabId = useMemo(
    () =>
      resolveRouteBackedActiveTabId({
        routeRecordId,
        recordById,
        storedActiveRecordId: resolvedStoredActiveRecordId,
      }),
    [recordById, resolvedStoredActiveRecordId, routeRecordId],
  );
  const nextOpenRecordIdsKey = nextOpenRecordIds.join("|");
  const openRecordIdsKey = openRecordIds.join("|");

  useEffect(() => {
    const shouldPreserveStoredActiveTab =
      !routeRecordId &&
      location.pathname === module.routes.base &&
      !isModuleRootTabId(sessionState.activeTabId) &&
      Boolean(resolvedStoredActiveRecordId);

    if (
      openRecordIdsKey === nextOpenRecordIdsKey &&
      (sessionState.activeTabId === routeBackedActiveTabId ||
        shouldPreserveStoredActiveTab)
    ) {
      return;
    }

    setModuleWorkspaceState(module.metadata.id, (prev) => ({
      ...prev,
      openRecordIds: nextOpenRecordIds,
      activeTabId: shouldPreserveStoredActiveTab
        ? prev.activeTabId
        : routeBackedActiveTabId,
    }));
  }, [
    location.pathname,
    module.metadata.id,
    module.routes.base,
    nextOpenRecordIds,
    nextOpenRecordIdsKey,
    openRecordIdsKey,
    routeBackedActiveTabId,
    resolvedStoredActiveRecordId,
    routeRecordId,
    sessionState.activeTabId,
    setModuleWorkspaceState,
  ]);

  const selectedRecordId =
    routeRecordId && recordById[routeRecordId] ? routeRecordId : undefined;
  const selectedRecord = selectedRecordId
    ? recordById[selectedRecordId]
    : undefined;

  const filteredRecords = useMemo(
    () => filterRecords(recordsState, searchQuery, runtimeModule.listPane),
    [recordsState, runtimeModule.listPane, searchQuery],
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, RECORDS_PER_PAGE]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset to page 1 when module changes
  useEffect(() => {
    setCurrentPage(1);
  }, [module.metadata.id]);

  const moduleTabs: LVETab[] = getLveModulesForSegment(userSegment).map(
    (registeredModule) => ({
      id: registeredModule.metadata.id,
      label: registeredModule.metadata.label,
      isActive: location.pathname.startsWith(registeredModule.routes.base),
      canClose: false,
    }),
  );

  const recordTabs: LVETab[] = buildRecordTabs({
    getRecordId: runtimeModule.listPane.getRecordId,
    getRecordLabel: runtimeModule.listPane.getRecordLabel,
    modulePluralLabel: module.metadata.pluralLabel,
    openRecordIds: nextOpenRecordIds,
    recordById,
    selectedRecordId,
  });

  const actionContext: LVEActionContext<TRecord> = {
    moduleId: module.metadata.id,
    selectedRecord,
    selectedRecordId,
  };

  const openCrudModal = (modal: "create" | "edit" | "delete") => {
    setCrudError(null);
    setActiveCrudModal(modal);
  };

  const handleCreateSubmit = async (values: Record<string, string>) => {
    const createConfig = module.crud?.create;
    if (!createConfig) {
      return;
    }

    setCrudError(null);
    setIsSubmittingCrud(true);

    try {
      const nextRecord =
        (await onCreateRecord?.({
          moduleId: module.metadata.id,
          values,
          records: recordsState,
        })) ?? createConfig.createRecord(values, { records: recordsState });
      const nextRecordId = runtimeModule.listPane.getRecordId(nextRecord);

      setRecordsState((prev) => {
        const remainingRecords = prev.filter(
          (record) =>
            runtimeModule.listPane.getRecordId(record) !== nextRecordId,
        );
        return [nextRecord, ...remainingRecords];
      });
      setModuleWorkspaceState(module.metadata.id, (prev) => ({
        ...prev,
        openRecordIds: [...new Set([...prev.openRecordIds, nextRecordId])],
        activeTabId: toRecordTabId(nextRecordId),
      }));
      setActiveCrudModal(null);
      navigate(module.routes.record(nextRecordId));
    } catch (error) {
      setCrudError(toErrorMessage(error));
    } finally {
      setIsSubmittingCrud(false);
    }
  };

  const handleEditSubmit = async (values: Record<string, string>) => {
    const editConfig = module.crud?.edit;
    if (!editConfig || !selectedRecord || !selectedRecordId) {
      return;
    }

    setCrudError(null);
    setIsSubmittingCrud(true);

    try {
      const nextRecord =
        (await onUpdateRecord?.({
          moduleId: module.metadata.id,
          record: selectedRecord,
          recordId: selectedRecordId,
          values,
          records: recordsState,
        })) ?? editConfig.updateRecord(selectedRecord, values);

      setRecordsState((prev) =>
        prev.map((record) =>
          runtimeModule.listPane.getRecordId(record) === selectedRecordId
            ? nextRecord
            : record,
        ),
      );
      setActiveCrudModal(null);
    } catch (error) {
      setCrudError(toErrorMessage(error));
    } finally {
      setIsSubmittingCrud(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord || !selectedRecordId) {
      return;
    }

    setCrudError(null);
    setIsSubmittingCrud(true);

    try {
      await onDeleteRecord?.({
        moduleId: module.metadata.id,
        record: selectedRecord,
        recordId: selectedRecordId,
        records: recordsState,
      });

      const remainingRecordIds = nextOpenRecordIds.filter(
        (recordId) => recordId !== selectedRecordId,
      );
      const fallbackRecordId =
        remainingRecordIds[remainingRecordIds.length - 1];

      setRecordsState((prev) =>
        prev.filter(
          (record) =>
            runtimeModule.listPane.getRecordId(record) !== selectedRecordId,
        ),
      );
      setModuleWorkspaceState(module.metadata.id, (prev) => ({
        ...prev,
        openRecordIds: remainingRecordIds,
        activeTabId: fallbackRecordId
          ? toRecordTabId(fallbackRecordId)
          : MODULE_ROOT_TAB_ID,
      }));
      setActiveCrudModal(null);
      navigate(
        fallbackRecordId
          ? module.routes.record(fallbackRecordId)
          : module.routes.base,
      );
    } catch (error) {
      setCrudError(toErrorMessage(error));
    } finally {
      setIsSubmittingCrud(false);
    }
  };

  const runAction = (action: LVEActionDefinition<TRecord>) => {
    if (action.intent === "create" && module.crud?.create) {
      openCrudModal("create");
      return;
    }

    if (action.intent === "edit" && selectedRecord && module.crud?.edit) {
      openCrudModal("edit");
      return;
    }

    if (action.intent === "delete" && selectedRecord && module.crud?.delete) {
      openCrudModal("delete");
      return;
    }

    action.onClick?.(actionContext);
  };

  const overrideProps: LVEWorkspaceOverrideProps<TRecord> = {
    module: runtimeModule,
    filteredRecords: paginatedRecords,
    selectedRecord,
    selectedRecordId,
    searchQuery,
    setSearchQuery,
    onSelectRecord: (record) =>
      navigate(
        module.routes.record(runtimeModule.listPane.getRecordId(record)),
      ),
  };

  const handleModuleTabSelect = (tabId: string) => {
    const targetModule = getLveModulesForSegment(userSegment).find(
      (registeredModule) => registeredModule.metadata.id === tabId,
    );

    if (
      !targetModule ||
      location.pathname.startsWith(targetModule.routes.base)
    ) {
      return;
    }

    const targetModuleState = getModuleWorkspaceState(targetModule.metadata.id);
    const targetActiveRecordId = toRecordIdFromTabId(
      targetModuleState.activeTabId,
    );
    const nextPath = targetActiveRecordId
      ? targetModule.routes.record(targetActiveRecordId)
      : targetModule.routes.base;

    navigate(nextPath);
  };

  const handleRecordTabSelect = (tabId: string) => {
    const nextRecordId = toRecordIdFromTabId(tabId);
    if (!nextRecordId) {
      setModuleWorkspaceState(module.metadata.id, (prev) => ({
        ...prev,
        activeTabId: MODULE_ROOT_TAB_ID,
      }));
    }

    navigate(
      nextRecordId ? module.routes.record(nextRecordId) : module.routes.base,
    );
  };

  const handleRecordTabClose = (tabId: string) => {
    const closingRecordId = toRecordIdFromTabId(tabId);

    if (!closingRecordId) {
      return;
    }

    const { fallbackRecordId, nextActiveTabId, remainingRecordIds } =
      resolveRecordTabClose({
        activeTabId: sessionState.activeTabId,
        closingRecordId,
        openRecordIds: nextOpenRecordIds,
        selectedRecordId,
      });

    setModuleWorkspaceState(module.metadata.id, (prev) => ({
      ...prev,
      openRecordIds: remainingRecordIds,
      activeTabId:
        selectedRecordId === closingRecordId
          ? nextActiveTabId
          : prev.activeTabId,
    }));

    if (selectedRecordId === closingRecordId) {
      navigate(
        fallbackRecordId
          ? module.routes.record(fallbackRecordId)
          : module.routes.base,
      );
    }
  };

  const workSections = selectedRecord
    ? runtimeModule.workWindow.getSections(selectedRecord)
    : [];
  const popSections = selectedRecord
    ? runtimeModule.popPane.getSections(selectedRecord)
    : [];
  const isPopPaneCollapsed =
    runtimeModule.popPane.collapsible === false
      ? false
      : sessionState.isPopPaneCollapsed;
  const workHeaderActions = selectedRecord
    ? [
        ...(runtimeModule.workWindow.lifecycleActions ?? []),
        ...(runtimeModule.workWindow.recordActions ?? []),
      ]
    : [];

  const listPaneNode = runtimeModule.listPaneOverride?.(overrideProps) ?? (
    <DefaultListPane
      config={runtimeModule.listPane}
      filteredRecords={paginatedRecords}
      selectedRecordId={selectedRecordId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSelectRecord={(record) =>
        navigate(
          module.routes.record(runtimeModule.listPane.getRecordId(record)),
        )
      }
      onAction={runAction}
      currentPage={currentPage}
      totalPages={totalPages}
      totalRecords={filteredRecords.length}
      onPageChange={setCurrentPage}
    />
  );

  const workPaneNode = runtimeModule.workPaneOverride?.(overrideProps) ?? (
    <DefaultWorkPane
      selectedRecord={selectedRecord}
      sections={workSections}
      innerTabs={runtimeModule.workWindow.innerTabs}
      emptyTitle={
        runtimeModule.workWindow.emptyTitle ?? runtimeModule.workWindow.title
      }
      emptyDescription={
        runtimeModule.workWindow.emptyDescription ??
        "Select a record to open a workspace tab."
      }
      isLoading={runtimeModule.workWindow.isLoading}
      errorMessage={runtimeModule.workWindow.errorMessage}
    />
  );

  const popPaneNode = runtimeModule.popPaneOverride?.(overrideProps) ?? (
    <DefaultPopPane
      selectedRecord={selectedRecord}
      sections={popSections}
      emptyTitle={
        runtimeModule.popPane.emptyTitle ?? runtimeModule.popPane.title
      }
      emptyDescription={
        runtimeModule.popPane.emptyDescription ??
        "Select a record to view contextual details."
      }
      onAction={runAction}
      quickActions={runtimeModule.popPane.quickActions}
      isLoading={runtimeModule.popPane.isLoading}
      errorMessage={runtimeModule.popPane.errorMessage}
    />
  );

  const listResultCount =
    runtimeModule.listPane.resultCountLabel?.(filteredRecords.length) ??
    `${filteredRecords.length} ${module.metadata.pluralLabel.toLowerCase()}`;

  return (
    <>
      <div className="flex h-full min-h-0 min-w-0 w-full flex-1">
        <LVEWorkspaceLayout
          headerTitle={`${module.metadata.label} Workspace`}
          headerDescription={`Reusable ${module.metadata.moduleType} workspace bound to ${currentTenantLabel} / ${currentStreamLabel}.`}
          headerActions={runtimeModule.workWindow.moduleActions?.map(
            (action) => ({
              ...action,
              onClick: () => runAction(action),
            }),
          )}
          moduleTabs={moduleTabs}
          moduleTabsLabel={module.tabs?.moduleTabLabel ?? "Modules"}
          onModuleTabSelect={handleModuleTabSelect}
          tabs={recordTabs}
          recordTabsLabel={module.tabs?.recordTabLabel ?? "Records"}
          onTabSelect={handleRecordTabSelect}
          onTabClose={handleRecordTabClose}
          listHeader={{
            eyebrow: "Queue",
            title: `${module.metadata.pluralLabel} Queue`,
            meta: (
              <span className="text-[11px] text-muted-foreground">
                {listResultCount}
              </span>
            ),
          }}
          listPane={listPaneNode}
          workHeader={{
            eyebrow: "Work Window",
            title: runtimeModule.workWindow.title,
            subtitle: selectedRecord
              ? runtimeModule.workWindow.getSelectedRecordTitle?.(
                  selectedRecord,
                )
              : runtimeModule.workWindow.subtitle,
            actions: workHeaderActions.map((action) => ({
              ...action,
              onClick: () => runAction(action),
            })),
          }}
          workPane={workPaneNode}
          popHeader={{
            eyebrow: "Context",
            title: runtimeModule.popPane.title,
          }}
          popPane={popPaneNode}
          popPaneCollapsible={runtimeModule.popPane.collapsible !== false}
          isPopPaneCollapsed={isPopPaneCollapsed}
          onPopPaneCollapsedChange={(nextValue) =>
            setModuleWorkspaceState(module.metadata.id, (prev) => ({
              ...prev,
              isPopPaneCollapsed: nextValue,
            }))
          }
          footer={`Scoped to ${currentTenantLabel} / ${currentStreamLabel}`}
        />
      </div>

      <LVERecordFormModal
        open={activeCrudModal === "create"}
        mode="create"
        moduleLabel={module.metadata.singularLabel}
        config={module.crud?.create}
        isSubmitting={isSubmittingCrud}
        errorMessage={
          activeCrudModal === "create" ? (crudError ?? undefined) : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setCrudError(null);
          }
          setActiveCrudModal(open ? "create" : null);
        }}
        onSubmit={handleCreateSubmit}
      />

      <LVERecordFormModal
        open={activeCrudModal === "edit"}
        mode="edit"
        moduleLabel={module.metadata.singularLabel}
        record={selectedRecord}
        config={module.crud?.edit}
        isSubmitting={isSubmittingCrud}
        errorMessage={
          activeCrudModal === "edit" ? (crudError ?? undefined) : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setCrudError(null);
          }
          setActiveCrudModal(open ? "edit" : null);
        }}
        onSubmit={handleEditSubmit}
      />

      <LVEDeleteModal
        open={activeCrudModal === "delete"}
        moduleLabel={module.metadata.singularLabel}
        record={selectedRecord}
        config={module.crud?.delete}
        isSubmitting={isSubmittingCrud}
        errorMessage={
          activeCrudModal === "delete" ? (crudError ?? undefined) : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setCrudError(null);
          }
          setActiveCrudModal(open ? "delete" : null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
