# Requirements Document

## Introduction

This feature migrates the global layout system from the `feature/Global_layout-Alex` source branch (Desktop path) into the `feature/lead-management-joseph` working branch (Pictures path). The migration introduces a new theme system, workspace context, shell components (AppShell, TopBar, MenuPane), shadcn-style UI primitives (scroll-area, button), and a new `LVEWorkspaceLayout` that replaces the current implementation — while preserving all existing routes and only wrapping the `/lead-management` route with the new `AppShell`. All writes target exclusively the Pictures path.

## Glossary

- **Source Branch**: The read-only codebase at `C:\Users\githi\OneDrive\Desktop\DQ_PROD_AdminApp_ATX` (branch: `feature/Global_layout-Alex`). No files are written here.
- **Working Branch**: The writable codebase at `C:\Users\githi\OneDrive\Pictures\DQ_PROD_AdminApp_ATX` (branch: `feature/lead-management-joseph`). All file writes target this path.
- **AppShell**: The new top-level layout shell component sourced from the Source Branch, composing TopBar and MenuPane.
- **TopBar**: The horizontal navigation bar component sourced from the Source Branch.
- **MenuPane**: The vertical side navigation component sourced from the Source Branch.
- **ThemeProvider**: A React context provider that manages light/dark theme state across the application.
- **LVEWorkspaceContext**: A React context that provides workspace-level state (active tab, pane visibility, etc.) to descendant components.
- **ModeToggle**: A UI control component that allows users to switch between light and dark modes.
- **LVEWorkspaceLayout**: The new workspace layout component sourced from the Source Branch, replacing the current implementation.
- **LVEWorkspaceLayoutLegacy**: The renamed version of the current `LVEWorkspaceLayout` component, preserved for backward compatibility with existing pages.
- **scroll-area**: A shadcn/ui-style scroll area primitive component sourced from the Source Branch.
- **button (ui)**: A shadcn/ui-style button primitive component sourced from the Source Branch, distinct from the existing `ButtonComponent.tsx`.
- **Migrator**: The automated process (Kiro agent) executing this migration.
- **Path Guard**: The rule that every file write must target a path beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

## Requirements

### Requirement 1: Tailwind and CSS Foundation

**User Story:** As a developer, I want the Tailwind configuration and global CSS from the Source Branch applied to the Working Branch, so that all new layout components render with the correct design tokens and utility classes.

#### Acceptance Criteria

1. THE Migrator SHALL copy `tailwind.config.js` from the Source Branch into the Working Branch, merging any new theme extensions (colors, fonts, spacing, dark mode config) with the existing content configuration.
2. THE Migrator SHALL copy the global CSS additions from `index.css` in the Source Branch into `src/index.css` in the Working Branch, preserving the existing Tailwind import directives.
3. IF the Working Branch `tailwind.config.js` already defines a `content` array, THEN THE Migrator SHALL retain that array and only add new theme keys from the Source Branch version.
4. THE Migrator SHALL write all output files to paths beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 2: Theme and Workspace Context Providers

**User Story:** As a developer, I want ThemeProvider, LVEWorkspaceContext, and ModeToggle available in the Working Branch, so that the new layout shell can consume theme and workspace state.

#### Acceptance Criteria

1. THE Migrator SHALL copy the `ThemeProvider` component from the Source Branch into the Working Branch at a path under `src/components/` or `src/context/` matching the Source Branch structure.
2. THE Migrator SHALL copy the `LVEWorkspaceContext` module from the Source Branch into the Working Branch, preserving its exported interface and hook signatures.
3. THE Migrator SHALL copy the `ModeToggle` component from the Source Branch into the Working Branch.
4. IF any of these three files import internal Source Branch modules that do not exist in the Working Branch, THEN THE Migrator SHALL resolve those imports by also copying the required dependency files.
5. THE Migrator SHALL write all output files to paths beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 3: Shell Components and UI Primitives

**User Story:** As a developer, I want AppShell, TopBar, MenuPane, scroll-area, and the ui/button primitive available in the Working Branch, so that the new global layout can be assembled.

#### Acceptance Criteria

1. THE Migrator SHALL copy the `AppShell` component from the Source Branch into the Working Branch, preserving its file path relative to `src/`.
2. THE Migrator SHALL copy the `TopBar` component from the Source Branch into the Working Branch, preserving its file path relative to `src/`.
3. THE Migrator SHALL copy the `MenuPane` component from the Source Branch into the Working Branch, preserving its file path relative to `src/`.
4. THE Migrator SHALL copy the `scroll-area` UI primitive from the Source Branch into `src/components/ui/` in the Working Branch.
5. THE Migrator SHALL copy the `button` UI primitive from the Source Branch into `src/components/ui/` in the Working Branch as a file distinct from the existing `ButtonComponent.tsx`.
6. IF any copied component imports a Source Branch dependency not present in the Working Branch, THEN THE Migrator SHALL also copy that dependency.
7. THE Migrator SHALL write all output files to paths beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 4: LVEWorkspaceLayout Rename and Replacement

**User Story:** As a developer, I want the existing LVEWorkspaceLayout preserved as LVEWorkspaceLayoutLegacy and the new LVEWorkspaceLayout introduced, so that existing pages continue to work while the new layout is available for the lead-management route.

#### Acceptance Criteria

1. THE Migrator SHALL rename the existing `src/components/layout/LVEWorkspaceLayout.tsx` in the Working Branch to `src/components/layout/LVEWorkspaceLayoutLegacy.tsx`, updating the exported component name and interface names to include the `Legacy` suffix.
2. THE Migrator SHALL update all existing import sites (`src/pages/accounts.tsx`, `src/pages/contacts.tsx`, `src/pages/lead-management.tsx`, `src/pages/leads.tsx`) to import from `LVEWorkspaceLayoutLegacy` instead of `LVEWorkspaceLayout`.
3. THE Migrator SHALL copy the new `LVEWorkspaceLayout` component from the Source Branch into `src/components/layout/LVEWorkspaceLayout.tsx` in the Working Branch.
4. IF the new `LVEWorkspaceLayout` imports `LVEWorkspaceContext`, `scroll-area`, or `button` primitives, THEN those dependencies SHALL already be present in the Working Branch before this file is written (per Requirements 2 and 3).
5. THE Migrator SHALL write all output files to paths beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 5: App.tsx Provider Integration

**User Story:** As a developer, I want App.tsx updated to include ThemeProvider and any other new providers from the Source Branch, so that the entire application has access to theme and workspace context.

#### Acceptance Criteria

1. THE Migrator SHALL add `ThemeProvider` to the provider tree in `src/App.tsx` in the Working Branch, wrapping the existing provider hierarchy at the appropriate level as defined in the Source Branch's `App.tsx`.
2. IF the Source Branch `App.tsx` includes additional providers not present in the Working Branch, THEN THE Migrator SHALL add those providers in the same nesting order as the Source Branch.
3. THE Migrator SHALL preserve all existing providers (`AzureAuthProvider`, `AuthProvider`, `AzureAuthWrapper`, `AppProvider`, `ToastProvider`) and their nesting order in `src/App.tsx`.
4. THE Migrator SHALL write the updated `src/App.tsx` to a path beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 6: AppRouter.tsx — Scoped AppShell Wrapping

**User Story:** As a developer, I want the `/lead-management` route wrapped with the new AppShell while all other routes remain unchanged, so that only the lead management module uses the new global layout.

#### Acceptance Criteria

1. THE Migrator SHALL update `src/AppRouter.tsx` in the Working Branch to wrap the `/lead-management` route's element with `AppShell`.
2. THE Migrator SHALL leave every other route in `src/AppRouter.tsx` exactly as it currently exists, with no structural changes.
3. IF the existing `/lead-management` route already wraps its content with `AppLayout`, THEN THE Migrator SHALL replace `AppLayout` with `AppShell` for that route only.
4. THE Migrator SHALL preserve all existing imports in `src/AppRouter.tsx` and add only the `AppShell` import.
5. THE Migrator SHALL write the updated `src/AppRouter.tsx` to a path beginning with `C:\Users\githi\OneDrive\Pictures\`.

---

### Requirement 7: Diagnostics and Error Resolution

**User Story:** As a developer, I want all modified files validated for TypeScript and lint errors after the migration, so that the Working Branch compiles cleanly.

#### Acceptance Criteria

1. WHEN a file is written to the Working Branch, THE Migrator SHALL run `getDiagnostics` on that file before proceeding to the next step.
2. IF `getDiagnostics` reports any errors on a modified file, THEN THE Migrator SHALL fix all reported errors before continuing.
3. THE Migrator SHALL run a final `getDiagnostics` pass across all modified files after all writes are complete.
4. IF the final diagnostics pass reports errors, THEN THE Migrator SHALL resolve them before declaring the migration complete.

---

### Requirement 8: Path Safety and Migration Audit

**User Story:** As a developer, I want a confirmed audit that every file written during the migration targets the Working Branch path, so that the Source Branch is never accidentally modified.

#### Acceptance Criteria

1. BEFORE every file write, THE Migrator SHALL verify that the target path begins with `C:\Users\githi\OneDrive\Pictures\`.
2. IF a computed target path does not begin with `C:\Users\githi\OneDrive\Pictures\`, THEN THE Migrator SHALL halt and report the path violation before writing.
3. THE Migrator SHALL produce a final summary listing every file written, with each entry confirming the full target path begins with `C:\Users\githi\OneDrive\Pictures\`.
4. THE Migrator SHALL never write any file to a path beginning with `C:\Users\githi\OneDrive\Desktop\`.
