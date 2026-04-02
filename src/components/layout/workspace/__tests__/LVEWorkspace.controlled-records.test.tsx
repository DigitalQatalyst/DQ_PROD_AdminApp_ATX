/**
 * LVEWorkspace Controlled Records Test Suite
 *
 * Validates API-first integration with controlled records and runtime state.
 * Tests the primary integration path where records come from external APIs
 * and local persistence is disabled.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { LVEWorkspace } from "../LVEWorkspace";
import { LVEWorkspaceModuleConfig } from "../types";
import { Building2, FileText, Users } from "lucide-react";
import { LVEWorkspaceProvider } from "../../../../context/LVEWorkspaceContext";
import { AuthProvider } from "../../../../context/AuthContext";

interface TestRecord {
  id: string;
  name: string;
  status: string;
  owner: string;
}

const createTestModule = (
  moduleId: string,
  moduleType: "record" | "workflow" | "parent-workspace" = "record",
): LVEWorkspaceModuleConfig<TestRecord> => ({
  metadata: {
    id: moduleId,
    label: `${moduleId} Module`,
    singularLabel: "Test Record",
    pluralLabel: "Test Records",
    route: `/${moduleId}`,
    icon: FileText,
    moduleType,
  },
  menu: {
    order: 10,
    visible: true,
  },
  routes: {
    base: `/${moduleId}`,
    record: (recordId) => `/${moduleId}/${recordId}`,
  },
  listPane: {
    records: [],
    getRecordId: (record) => record.id,
    getRecordLabel: (record) => record.name,
    columns: [
      {
        id: "name",
        label: "Name",
        slot: "primary",
        render: (record) => record.name,
      },
      {
        id: "status",
        label: "Status",
        slot: "badge",
        render: (record) => record.status,
      },
    ],
  },
  workWindow: {
    title: "Test Workspace",
    getSections: (record) => [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "name", label: "Name", render: () => record.name },
          { id: "status", label: "Status", render: () => record.status },
        ],
      },
    ],
  },
  popPane: {
    title: "Context",
    getSections: (record) => [
      {
        id: "context",
        title: "Details",
        items: [{ id: "owner", label: "Owner", render: () => record.owner }],
      },
    ],
  },
});

const createTestRecords = (count: number): TestRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 1}`,
    name: `Test Record ${i + 1}`,
    status: i % 2 === 0 ? "active" : "pending",
    owner: `Owner ${i + 1}`,
  }));

const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialRoute?: string;
}> = ({ children, initialRoute = "/test-module" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <AuthProvider>
      <LVEWorkspaceProvider>
        <Routes>
          <Route path="/test-module" element={children} />
          <Route path="/test-module/:recordId" element={children} />
          <Route path="/workflow-module" element={children} />
          <Route path="/workflow-module/:recordId" element={children} />
          <Route path="/parent-module" element={children} />
          <Route path="/parent-module/:recordId" element={children} />
        </Routes>
      </LVEWorkspaceProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("LVEWorkspace - Controlled Records (API-First)", () => {
  beforeEach(() => {
    // Mock localStorage for AuthProvider to provide user context
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
      organization_id: "test-org-id",
    };
    localStorage.setItem("platform_admin_user", JSON.stringify(mockUser));
    localStorage.setItem("user_role", "admin");
    localStorage.setItem("user_segment", "test-segment");
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe("Basic Controlled Record Rendering", () => {
    it("renders controlled records from props", () => {
      const module = createTestModule("test-module");
      const records = createTestRecords(3);

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      expect(screen.getByText("Test Record 2")).toBeInTheDocument();
      expect(screen.getByText("Test Record 3")).toBeInTheDocument();
    });

    it("updates when controlled records change", async () => {
      const module = createTestModule("test-module");
      const initialRecords = createTestRecords(2);

      const { rerender } = render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={initialRecords}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Record 3")).not.toBeInTheDocument();

      const updatedRecords = createTestRecords(3);
      rerender(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={updatedRecords}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Record 3")).toBeInTheDocument();
      });
    });

    it("does not persist controlled records to localStorage", () => {
      const module = createTestModule("test-module");
      const records = createTestRecords(2);
      const localStorageSetSpy = jest.spyOn(Storage.prototype, "setItem");

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(localStorageSetSpy).not.toHaveBeenCalled();
      localStorageSetSpy.mockRestore();
    });
  });

  describe("Runtime State - Loading", () => {
    it("displays loading state in list pane", () => {
      const module = createTestModule("test-module");

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={[]}
            state={{ listPane: { isLoading: true } }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Loading records...")).toBeInTheDocument();
    });

    it("displays loading state in work window", () => {
      const module = createTestModule("test-module");
      const records = createTestRecords(1);

      render(
        <TestWrapper initialRoute="/test-module/record-1">
          <LVEWorkspace
            module={module}
            records={records}
            state={{ workWindow: { isLoading: true } }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Loading workspace...")).toBeInTheDocument();
    });

    it("displays loading state in pop pane", () => {
      const module = createTestModule("test-module");
      const records = createTestRecords(1);

      render(
        <TestWrapper initialRoute="/test-module/record-1">
          <LVEWorkspace
            module={module}
            records={records}
            state={{ popPane: { isLoading: true } }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Loading context...")).toBeInTheDocument();
    });
  });

  describe("Runtime State - Empty", () => {
    it("displays custom empty state in list pane", () => {
      const module = createTestModule("test-module");

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={[]}
            state={{
              listPane: {
                emptyTitle: "No Data Available",
                emptyDescription: "Try adjusting your filters.",
              },
            }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("No Data Available")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters."),
      ).toBeInTheDocument();
    });
  });

  describe("Runtime State - Error", () => {
    it("displays error state in list pane", () => {
      const module = createTestModule("test-module");

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={[]}
            state={{
              listPane: { errorMessage: "Failed to load records from API" },
            }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(
        screen.getByText("Failed to load records from API"),
      ).toBeInTheDocument();
    });

    it("displays error state in work window", () => {
      const module = createTestModule("test-module");
      const records = createTestRecords(1);

      render(
        <TestWrapper initialRoute="/test-module/record-1">
          <LVEWorkspace
            module={module}
            records={records}
            state={{
              workWindow: { errorMessage: "Failed to load record details" },
            }}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(
        screen.getByText("Failed to load record details"),
      ).toBeInTheDocument();
    });
  });

  describe("Record Tab Behavior with Controlled Data", () => {
    it("opens record tab when selecting from list", async () => {
      const user = userEvent.setup();
      const module = createTestModule("test-module");
      const records = createTestRecords(3);

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      const recordButton = screen.getByText("Test Record 2");
      await user.click(recordButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Test Record 2/i }),
        ).toBeInTheDocument();
      });
    });

    it("closes record tab and navigates to fallback", async () => {
      const user = userEvent.setup();
      const module = createTestModule("test-module");
      const records = createTestRecords(2);

      render(
        <TestWrapper initialRoute="/test-module/record-1">
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg[class*="lucide-x"]'),
      );

      if (closeButton) {
        await user.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.getByText("Test Records")).toBeInTheDocument();
      });
    });

    it("handles record removal from controlled data", async () => {
      const module = createTestModule("test-module");
      const initialRecords = createTestRecords(3);

      const { rerender } = render(
        <TestWrapper initialRoute="/test-module/record-2">
          <LVEWorkspace
            module={module}
            records={initialRecords}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Record 2")).toBeInTheDocument();
      });

      const updatedRecords = initialRecords.filter((r) => r.id !== "record-2");
      rerender(
        <TestWrapper initialRoute="/test-module/record-2">
          <LVEWorkspace
            module={module}
            records={updatedRecords}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.queryByText("Test Record 2")).not.toBeInTheDocument();
      });
    });
  });

  describe("Module Type Variations", () => {
    it("renders record module with controlled data", () => {
      const module = createTestModule("test-module", "record");
      const records = createTestRecords(2);

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      expect(screen.getByText("Test Record 2")).toBeInTheDocument();
    });

    it("renders workflow module with controlled data", () => {
      const module = createTestModule("workflow-module", "workflow");
      const records = createTestRecords(2);

      render(
        <TestWrapper initialRoute="/workflow-module">
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      expect(screen.getByText("Test Record 2")).toBeInTheDocument();
    });

    it("renders parent-workspace module with controlled data", () => {
      const module = createTestModule("parent-module", "parent-workspace");
      const records = createTestRecords(2);

      render(
        <TestWrapper initialRoute="/parent-module">
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("Test Record 1")).toBeInTheDocument();
      expect(screen.getByText("Test Record 2")).toBeInTheDocument();
    });
  });

  describe("Search with Controlled Records", () => {
    it("filters controlled records by search query", async () => {
      const user = userEvent.setup();
      const module = createTestModule("test-module");
      const records = createTestRecords(5);

      render(
        <TestWrapper>
          <LVEWorkspace
            module={module}
            records={records}
            persistLocalRecords={false}
          />
        </TestWrapper>,
      );

      const searchInput = screen.getByPlaceholderText("Search records");
      await user.type(searchInput, "Record 3");

      await waitFor(() => {
        expect(screen.getByText("Test Record 3")).toBeInTheDocument();
        expect(screen.queryByText("Test Record 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Test Record 2")).not.toBeInTheDocument();
      });
    });
  });
});
