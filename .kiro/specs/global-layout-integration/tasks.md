# Implementation Plan: Global Layout Integration

## Overview

Migrate the global layout system from the source branch (Desktop, read-only) into the working
branch (Pictures, write target). Tasks follow the dependency order defined in the design's file
mapping table. Every write targets `C:\Users\githi\OneDrive\Pictures\DQ_PROD_AdminApp_ATX\`.

## Tasks

- [x] 1. Add @radix-ui/react-scroll-area dependency
  - Read `package.json` from source branch (Desktop path) to confirm version (`^1.2.10`)
  - Add `"@radix-ui/react-scroll-area": "^1.2.10"` to `dependencies` in working branch `package.json`
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `package.json` after write; fix any errors
  - Instruct user to run `npm install` in the working branch directory
  - _Requirements: 3.4, 7.1, 8.1_

- [x] 2. Merge tailwind.config.js
  - Read `tailwind.config.js` from source branch (Desktop) — capture `theme.extend` block
  - Read `tailwind.config.js` from working branch (Pictures) — capture existing `content` array
  - Write merged `tailwind.config.js` to working branch: retain working branch `content` array, add full `theme.extend` block from source (colors, borderRadius, pane color keys)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `tailwind.config.js`; fix any errors
  - _Requirements: 1.1, 1.3, 1.4, 7.1, 8.1_

  - [ ]* 2.1 Write property test for Tailwind config merge (Property 3)
    - **Property 3: Tailwind Config Merge Preserves Content Array**
    - **Validates: Requirements 1.1, 1.3**
    - Implement `mergeTailwindConfig(base, source)` helper and fast-check property test
    - Assert merged output contains original `content` array unchanged
    - Assert merged output contains `theme.extend.colors` from source


- [x] 3. Merge src/index.css
  - Read `src/index.css` from source branch — capture all `@layer base` and `@layer components` blocks containing CSS variable declarations (`:root { ... }`, `.dark { ... }`)
  - Read `src/index.css` from working branch — preserve all existing `@import 'tailwindcss/...'` directives
  - Write merged `src/index.css` to working branch: keep existing `@import` lines at top, append source `@layer` blocks below
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/index.css`; fix any errors
  - _Requirements: 1.2, 1.4, 7.1, 8.1_

  - [ ]* 3.1 Write property test for CSS merge (Property 4)
    - **Property 4: CSS Merge Preserves Existing Import Directives**
    - **Validates: Requirements 1.2**
    - Implement `mergeCss(base, source)` helper and fast-check property test
    - Assert all original `@import` lines are present in merged output
    - Assert merged output contains `:root {` and `.dark {` blocks

- [x] 4. Copy src/components/theme-provider.tsx
  - Read `src/components/theme-provider.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/theme-provider.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/components/theme-provider.tsx`; fix any errors
  - _Requirements: 2.1, 2.5, 7.1, 8.1_

- [x] 5. Copy src/components/ui/button.tsx
  - Read `src/components/ui/button.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/ui/button.tsx` in working branch (Pictures) — distinct from existing `ButtonComponent.tsx`
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/components/ui/button.tsx`; fix any errors
  - _Requirements: 3.5, 3.7, 7.1, 8.1_

- [x] 6. Copy src/components/ui/scroll-area.tsx
  - Read `src/components/ui/scroll-area.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/ui/scroll-area.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/components/ui/scroll-area.tsx`; fix any errors (requires `@radix-ui/react-scroll-area` from task 1)
  - _Requirements: 3.4, 3.7, 7.1, 8.1_

- [x] 7. Copy src/components/ui/mode-toggle.tsx
  - Read `src/components/ui/mode-toggle.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/ui/mode-toggle.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/components/ui/mode-toggle.tsx`; fix any errors
  - _Requirements: 2.3, 2.5, 7.1, 8.1_

- [x] 8. Checkpoint — foundation layer complete
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm `theme-provider.tsx`, `button.tsx`, `scroll-area.tsx`, `mode-toggle.tsx` all have zero diagnostics errors before proceeding to shell components


- [x] 9. Copy src/components/layout/TopBar.tsx
  - Read `src/components/layout/TopBar.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/layout/TopBar.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Confirm imports resolve: `Button` → `../ui/ButtonComponent` (existing), `ModeToggle` → `../ui/mode-toggle` (task 7), `Badge` and `DropdownMenu` already exist
  - Run `getDiagnostics` on `src/components/layout/TopBar.tsx`; fix any errors
  - _Requirements: 3.2, 3.6, 3.7, 7.1, 8.1_

- [x] 10. Copy src/components/layout/MenuPane.tsx
  - Read `src/components/layout/MenuPane.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/layout/MenuPane.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Confirm imports resolve: `ScrollArea` → `../ui/scroll-area` (task 6), `cn` already exists, `useAuth` already exists
  - Run `getDiagnostics` on `src/components/layout/MenuPane.tsx`; fix any errors
  - _Requirements: 3.3, 3.6, 3.7, 7.1, 8.1_

- [x] 11. Copy src/components/layout/AppShell.tsx
  - Read `src/components/layout/AppShell.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/layout/AppShell.tsx` in working branch (Pictures)
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Confirm imports resolve: `TopBar` (task 9), `MenuPane` (task 10) both present
  - Run `getDiagnostics` on `src/components/layout/AppShell.tsx`; fix any errors
  - _Requirements: 3.1, 3.6, 3.7, 7.1, 8.1_

  - [ ]* 11.1 Write property test for dependency closure (Property 2)
    - **Property 2: Dependency Closure**
    - **Validates: Requirements 2.4, 3.6**
    - Implement `extractRelativeImports(filePath)` and `fileExistsInWorkingBranch(importPath)` helpers
    - Write fast-check property test iterating over all copied files
    - Assert every relative import in each copied file resolves to an existing working branch file

- [x] 12. Checkpoint — shell components complete
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm `TopBar.tsx`, `MenuPane.tsx`, `AppShell.tsx` all have zero diagnostics errors before proceeding to layout rename

- [x] 13. Create LVEWorkspaceLayoutLegacy.tsx from existing working branch file
  - Read `src/components/layout/LVEWorkspaceLayout.tsx` from working branch (Pictures)
  - Write `src/components/layout/LVEWorkspaceLayoutLegacy.tsx` to working branch with these renames applied:
    - `export interface LVETab` → `export interface LVETabLegacy`
    - `export interface LVEWorkspaceLayoutProps` → `export interface LVEWorkspaceLayoutLegacyProps`
    - `export const LVEWorkspaceLayout` → `export const LVEWorkspaceLayoutLegacy`
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/components/layout/LVEWorkspaceLayoutLegacy.tsx`; fix any errors
  - _Requirements: 4.1, 4.5, 7.1, 8.1_

- [ ] 14. Update import sites to use LVEWorkspaceLayoutLegacy
  - [x] 14.1 Update src/pages/lead-management.tsx
    - Change import path from `../components/layout/LVEWorkspaceLayout` to `../components/layout/LVEWorkspaceLayoutLegacy`
    - Update imported symbol names: `LVEWorkspaceLayout` → `LVEWorkspaceLayoutLegacy`, `LVEWorkspaceLayoutProps` → `LVEWorkspaceLayoutLegacyProps`, `LVETab` → `LVETabLegacy`
    - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
    - Run `getDiagnostics` on `src/pages/lead-management.tsx`; fix any errors
    - _Requirements: 4.2, 4.5, 7.1, 8.1_

  - [x] 14.2 Update src/pages/accounts.tsx
    - Change import path and symbol names to Legacy variants (same pattern as 14.1)
    - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
    - Run `getDiagnostics` on `src/pages/accounts.tsx`; fix any errors
    - _Requirements: 4.2, 4.5, 7.1, 8.1_

  - [x] 14.3 Update src/pages/contacts.tsx
    - Change import path and symbol names to Legacy variants (same pattern as 14.1)
    - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
    - Run `getDiagnostics` on `src/pages/contacts.tsx`; fix any errors
    - _Requirements: 4.2, 4.5, 7.1, 8.1_

  - [x] 14.4 Update src/pages/leads.tsx
    - Change import path and symbol names to Legacy variants (same pattern as 14.1)
    - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
    - Run `getDiagnostics` on `src/pages/leads.tsx`; fix any errors
    - _Requirements: 4.2, 4.5, 7.1, 8.1_

  - [ ]* 14.5 Write property test for import site completeness (Property 5)
    - **Property 5: Import Site Completeness**
    - **Validates: Requirements 4.2**
    - Write fast-check property test over the four import site files
    - Assert no file contains `from '../components/layout/LVEWorkspaceLayout'` (non-legacy)
    - Assert each file contains `from '../components/layout/LVEWorkspaceLayoutLegacy'`


- [x] 15. Copy new src/components/layout/LVEWorkspaceLayout.tsx from source
  - Read `src/components/layout/LVEWorkspaceLayout.tsx` from source branch (Desktop)
  - Write verbatim to `src/components/layout/LVEWorkspaceLayout.tsx` in working branch (Pictures) — this overwrites the old file
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Confirm the new file uses CSS variable tokens (`bg-background`, `border-border`, `text-foreground`, etc.) — these require the merged `index.css` from task 3
  - Run `getDiagnostics` on `src/components/layout/LVEWorkspaceLayout.tsx`; fix any errors
  - _Requirements: 4.3, 4.4, 4.5, 7.1, 8.1_

- [x] 16. Update src/App.tsx — add ThemeProvider as outermost wrapper
  - Read `src/App.tsx` from working branch (Pictures) — note existing provider nesting order
  - Read `src/App.tsx` from source branch (Desktop) — confirm `ThemeProvider` placement and props
  - Add `import { ThemeProvider } from './components/theme-provider';` to imports
  - Wrap the existing `<AzureAuthProvider>` tree with `<ThemeProvider defaultTheme="light" storageKey="atx-ui-theme">` as the outermost element
  - Preserve all five existing providers (`AzureAuthProvider`, `AuthProvider`, `AzureAuthWrapper`, `AppProvider`, `ToastProvider`) and their nesting order unchanged
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/App.tsx`; fix any errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 8.1_

  - [ ]* 16.1 Write property test for provider nesting preserved (Property 6)
    - **Property 6: Existing Provider Nesting Preserved**
    - **Validates: Requirements 5.1, 5.3**
    - Write fast-check property test reading the migrated `src/App.tsx`
    - Assert all six providers appear in order: `ThemeProvider`, `AzureAuthProvider`, `AuthProvider`, `AzureAuthWrapper`, `AppProvider`, `ToastProvider`
    - Assert each provider's opening tag position is greater than the previous one

- [x] 17. Update src/AppRouter.tsx — wrap /lead-management with AppShell
  - Read `src/AppRouter.tsx` from working branch (Pictures) — identify the `/lead-management` route element
  - Add `import { AppShell } from './components/layout/AppShell';` to imports
  - Replace `<AppLayout activeSection="lead-management"><LeadManagementModule /></AppLayout>` with `<AppShell><LeadManagementModule /></AppShell>` for the `/lead-management` route only
  - Leave every other route element structure exactly unchanged
  - Preserve all existing imports; add only the `AppShell` import
  - Verify target path begins with `C:\Users\githi\OneDrive\Pictures\` before writing
  - Run `getDiagnostics` on `src/AppRouter.tsx`; fix any errors
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 8.1_

  - [ ]* 17.1 Write property test for non-lead-management routes unchanged (Property 7)
    - **Property 7: Non-Lead-Management Routes Unchanged**
    - **Validates: Requirements 6.2**
    - Implement `extractRouteElement(routerContent, routePath)` helper
    - Write fast-check property test over all non-`/lead-management` route paths
    - Assert each route's element structure in the migrated file equals the pre-migration structure

- [x] 18. Checkpoint — layout wiring complete
  - Ensure all tests pass, ask the user if questions arise.
  - Confirm `LVEWorkspaceLayoutLegacy.tsx`, `LVEWorkspaceLayout.tsx`, `App.tsx`, `AppRouter.tsx` all have zero diagnostics errors

- [x] 19. Final getDiagnostics pass on all modified files
  - Run `getDiagnostics` on all files modified during the migration:
    - `package.json`
    - `tailwind.config.js`
    - `src/index.css`
    - `src/components/theme-provider.tsx`
    - `src/components/ui/button.tsx`
    - `src/components/ui/scroll-area.tsx`
    - `src/components/ui/mode-toggle.tsx`
    - `src/components/layout/TopBar.tsx`
    - `src/components/layout/MenuPane.tsx`
    - `src/components/layout/AppShell.tsx`
    - `src/components/layout/LVEWorkspaceLayoutLegacy.tsx`
    - `src/components/layout/LVEWorkspaceLayout.tsx`
    - `src/pages/lead-management.tsx`
    - `src/pages/accounts.tsx`
    - `src/pages/contacts.tsx`
    - `src/pages/leads.tsx`
    - `src/App.tsx`
    - `src/AppRouter.tsx`
  - Fix all reported errors before declaring migration complete
  - _Requirements: 7.3, 7.4_

  - [ ]* 19.1 Write property test for zero diagnostics errors (Property 8)
    - **Property 8: Zero Diagnostics Errors on Completion**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - Write fast-check property test iterating over all modified files listed above
    - Assert `getDiagnostics` returns zero errors for each file

- [ ] 20. Write path safety property test (Property 1)
  - [ ]* 20.1 Write property test for path safety invariant (Property 1)
    - **Property 1: Path Safety Invariant**
    - **Validates: Requirements 1.4, 2.5, 3.7, 8.1, 8.2, 8.4**
    - Implement `validateWritePath(path: string): boolean` — returns `true` iff path starts with `C:\Users\githi\OneDrive\Pictures\`
    - Write fast-check property test over arbitrary strings
    - Assert `validateWritePath` returns `true` only for paths with the Pictures prefix
    - Assert `validateWritePath` returns `false` for any path starting with the Desktop prefix

- [x] 21. Final checkpoint — migration complete
  - Ensure all tests pass, ask the user if questions arise.
  - Produce migration audit summary listing every file written with full target path confirmation (each entry must begin with `C:\Users\githi\OneDrive\Pictures\`)
  - _Requirements: 8.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Every write must be preceded by a path prefix check (`C:\Users\githi\OneDrive\Pictures\`)
- Desktop path (`C:\Users\githi\OneDrive\Desktop\`) is read-only — never write there
- `getDiagnostics` must be run after every file write; fix all errors before the next task
- Task 1 (`npm install`) must complete before task 6 (`scroll-area.tsx`) to avoid module-not-found errors
- Tasks 4–7 (primitives and providers) must complete before tasks 9–11 (shell components)
- Task 13 (Legacy rename) and task 14 (import site updates) must complete before task 15 (new LVEWorkspaceLayout copy)
- Property tests use fast-check (already in the project's test suite pattern, compatible with Jest/Vitest)
