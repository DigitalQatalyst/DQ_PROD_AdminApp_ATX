# Design Document: Global Layout Integration

## Overview

This migration copies the global layout system from the `feature/Global_layout-Alex` source branch
(`C:\Users\githi\OneDrive\Desktop\DQ_PROD_AdminApp_ATX`) into the `feature/lead-management-joseph`
working branch (`C:\Users\githi\OneDrive\Pictures\DQ_PROD_AdminApp_ATX`).

The source branch already has a complete, working implementation of:
- A CSS-variable-based design token system (Tailwind + `index.css`)
- A `ThemeProvider` with light/dark/system switching
- A `ModeToggle` UI control
- `AppShell`, `TopBar`, and `MenuPane` shell components
- shadcn-style `button.tsx` and `scroll-area.tsx` UI primitives
- A new `LVEWorkspaceLayout` that uses CSS variable tokens instead of hardcoded Tailwind slate colors

The working branch has none of these except the old `LVEWorkspaceLayout` (hardcoded slate colors)
and `AppLayout` (the legacy full-page shell). The migration introduces the new system while
preserving all existing routes and only wrapping `/lead-management` with `AppShell`.

All file writes target exclusively the Pictures path. The Desktop path is read-only.

---

## Architecture

### Before Migration

```
App.tsx
  AzureAuthProvider
    AuthProvider
      AzureAuthWrapper
        AppProvider
          ToastProvider
            AppRouter
              /lead-management  → AppLayout (legacy) → LeadManagementModule
              /other-routes     → AppLayout (legacy) → ...
```

### After Migration

```
App.tsx
  ThemeProvider  ← NEW (outermost, wraps everything)
    AzureAuthProvider
      AuthProvider
        AzureAuthWrapper
          AppProvider
            ToastProvider
              AppRouter
                /lead-management  → AppShell (NEW) → LeadManagementModule
                /other-routes     → AppLayout (legacy, unchanged)
```

### Component Dependency Graph

```
AppShell
  ├── TopBar
  │     ├── useAuth (context/AuthContext)
  │     ├── Button (components/ui/button.tsx)  ← NEW primitive
  │     ├── Badge (components/ui/Badge.tsx)    ← already exists
  │     ├── ModeToggle (components/ui/mode-toggle.tsx)  ← NEW
  │     │     ├── useTheme (components/theme-provider.tsx)  ← NEW
  │     │     └── Button (components/ui/button.tsx)
  │     └── DropdownMenu (components/ui/DropdownMenu.tsx)  ← already exists
  └── MenuPane
        ├── useAuth (context/AuthContext)
        ├── cn (utils/cn.ts)                  ← already exists
        └── ScrollArea (components/ui/scroll-area.tsx)  ← NEW primitive
              └── @radix-ui/react-scroll-area ← already in package.json

LVEWorkspaceLayout (new, from source)
  └── (no new imports — pure JSX with CSS variable tokens)

ThemeProvider (components/theme-provider.tsx)
  └── (no imports beyond React)

ModeToggle (components/ui/mode-toggle.tsx)
  ├── useTheme ← components/theme-provider.tsx
  ├── Button   ← components/ui/button.tsx
  └── DropdownMenu ← components/ui/DropdownMenu.tsx

button.tsx (components/ui/button.tsx)
  ├── @radix-ui/react-slot  ← already in package.json
  ├── class-variance-authority ← already in package.json
  └── cn (utils/cn.ts)

scroll-area.tsx (components/ui/scroll-area.tsx)
  ├── @radix-ui/react-scroll-area ← already in package.json (source only)
  └── cn (utils/cn.ts)
```

**Key finding:** `@radix-ui/react-scroll-area` is present in the source branch `package.json`
but NOT in the working branch `package.json`. It must be added before `scroll-area.tsx` will
compile. All other npm dependencies (`@radix-ui/react-slot`, `class-variance-authority`) are
already present in the working branch.

**Key finding:** `LVEWorkspaceContext` is referenced in the requirements glossary but does not
exist as a file in the source branch. No file copy is needed for this item.

---

## Components and Interfaces

### ThemeProvider (`src/components/theme-provider.tsx`)

```typescript
type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;       // default: "system"
  storageKey?: string;        // default: "atx-ui-theme"
}

// Exported hook
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void }
```

Persists theme choice to `localStorage[storageKey]`. Applies `"light"` or `"dark"` class to
`document.documentElement`. Listens for system preference changes when `theme === "system"`.
Keyboard shortcut: `Ctrl/Cmd+Shift+T` cycles through themes.

### ModeToggle (`src/components/ui/mode-toggle.tsx`)

Dropdown button (Sun/Moon icon) that calls `setTheme` from `useTheme`. Depends on `Button`
(new `button.tsx`) and `DropdownMenu`.

### Button (`src/components/ui/button.tsx`)

shadcn-style CVA button. Variants: `default | destructive | outline | secondary | ghost | link`.
Sizes: `default | sm | lg | icon`. Supports `asChild` via `@radix-ui/react-slot`.
**Distinct from** the existing `src/components/ui/ButtonComponent.tsx`.

### ScrollArea (`src/components/ui/scroll-area.tsx`)

Thin wrapper around `@radix-ui/react-scroll-area`. Exports `ScrollArea` and `ScrollBar`.
Used by `MenuPane` for the navigation list.

### AppShell (`src/components/layout/AppShell.tsx`)

```typescript
interface AppShellProps { children: ReactNode; }
export function AppShell({ children }: AppShellProps)
```

Full-viewport shell: `h-screen flex flex-col`. Renders `<TopBar />` at top, then a flex row
containing `<MenuPane />` (fixed 256 px) and `<main>` (flex-1) for page content.

### TopBar (`src/components/layout/TopBar.tsx`)

Fixed-height (`h-14`) horizontal bar. Reads `userSegment` from `useAuth`. Renders:
- Left: app logo + title
- Center: tenant dropdown + stream dropdown (both use new `Button` + `DropdownMenu`)
- Right: segment badge, settings button, `ModeToggle`, user chip

### MenuPane (`src/components/layout/MenuPane.tsx`)

Fixed-width (`w-64`) vertical nav. Reads `userSegment` from `useAuth` to filter nav items.
Uses `ScrollArea` for the nav list. Manages `expandedSections` state locally.
Navigation items: CRM Modules, Analytics & Monitoring, Content & Data, Support.

### LVEWorkspaceLayout — new (`src/components/layout/LVEWorkspaceLayout.tsx`)

Identical interface to the current working branch version but uses CSS variable tokens
(`bg-background`, `border-border`, `text-foreground`, etc.) instead of hardcoded
`bg-slate-*` / `text-slate-*` classes. This enables proper dark mode support.

### LVEWorkspaceLayoutLegacy (`src/components/layout/LVEWorkspaceLayoutLegacy.tsx`)

The current working branch `LVEWorkspaceLayout.tsx` renamed. Exported names updated:
- `LVEWorkspaceLayout` → `LVEWorkspaceLayoutLegacy`
- `LVEWorkspaceLayoutProps` → `LVEWorkspaceLayoutLegacyProps`
- `LVETab` → `LVETabLegacy`

---

## Data Models

### Theme State

```typescript
type Theme = "dark" | "light" | "system";
// Persisted in: localStorage["atx-ui-theme"]
// Applied as: class on document.documentElement ("light" | "dark")
```

### Navigation Item

```typescript
interface NavigationItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path?: string;
  children?: NavigationItem[];
  requiredSegments?: string[];   // filters by userSegment from AuthContext
}
```

### LVETab (new, from source)

```typescript
export interface LVETab {
  id: string;
  label: string;
  isActive?: boolean;
  isDirty?: boolean;
}
```

---

## File Mapping: Source → Target

All target paths begin with `C:\Users\githi\OneDrive\Pictures\DQ_PROD_AdminApp_ATX\`.

| # | Action | Source (Desktop) | Target (Pictures) |
|---|--------|-----------------|-------------------|
| 1 | Merge  | `tailwind.config.js` | `tailwind.config.js` |
| 2 | Merge  | `src/index.css` | `src/index.css` |
| 3 | Copy   | `src/components/theme-provider.tsx` | `src/components/theme-provider.tsx` |
| 4 | Copy   | `src/components/ui/mode-toggle.tsx` | `src/components/ui/mode-toggle.tsx` |
| 5 | Copy   | `src/components/ui/button.tsx` | `src/components/ui/button.tsx` |
| 6 | Copy   | `src/components/ui/scroll-area.tsx` | `src/components/ui/scroll-area.tsx` |
| 7 | Copy   | `src/components/layout/AppShell.tsx` | `src/components/layout/AppShell.tsx` |
| 8 | Copy   | `src/components/layout/TopBar.tsx` | `src/components/layout/TopBar.tsx` |
| 9 | Copy   | `src/components/layout/MenuPane.tsx` | `src/components/layout/MenuPane.tsx` |
| 10 | Rename | `src/components/layout/LVEWorkspaceLayout.tsx` (working) | `src/components/layout/LVEWorkspaceLayoutLegacy.tsx` |
| 11 | Copy   | `src/components/layout/LVEWorkspaceLayout.tsx` (source) | `src/components/layout/LVEWorkspaceLayout.tsx` |
| 12 | Update | — | `src/pages/lead-management.tsx` (import → Legacy) |
| 13 | Update | — | `src/pages/accounts.tsx` (import → Legacy) |
| 14 | Update | — | `src/pages/contacts.tsx` (import → Legacy) |
| 15 | Update | — | `src/pages/leads.tsx` (import → Legacy) |
| 16 | Update | `src/App.tsx` (source, reference) | `src/App.tsx` (add ThemeProvider) |
| 17 | Update | `src/AppRouter.tsx` (source, reference) | `src/AppRouter.tsx` (wrap /lead-management with AppShell) |
| 18 | Add dep | — | `package.json` (add `@radix-ui/react-scroll-area`) |

**Note on #18:** The working branch `package.json` does not include `@radix-ui/react-scroll-area`.
It must be added (matching the source branch version `^1.2.10`) and `npm install` run before
`scroll-area.tsx` will compile.

---

## Implementation Approach per Requirement

### Requirement 1 — Tailwind and CSS Foundation

**tailwind.config.js merge strategy:**
The working branch currently has only `content: [...]` with no `theme.extend`. The source branch
adds `theme.extend.colors` (CSS variable tokens), `theme.extend.borderRadius`, and three custom
pane color keys (`pane-menu`, `pane-list`, `pane-work`). The merged output retains the working
branch `content` array and adds the full `theme.extend` block from the source.

**index.css merge strategy:**
The working branch uses `@import 'tailwindcss/base'` syntax (PostCSS import style). The source
uses `@tailwind base` directive syntax. The working branch comment explicitly says never to delete
the imports. The merged file keeps the existing `@import` lines at the top and appends all
`@layer base` and `@layer components` blocks from the source below them.

### Requirement 2 — Theme and Workspace Context Providers

- Copy `src/components/theme-provider.tsx` verbatim (no internal dependencies beyond React).
- Copy `src/components/ui/mode-toggle.tsx` verbatim (depends on `theme-provider`, `button.tsx`,
  `DropdownMenu` — all will be present after steps 3–5).
- `LVEWorkspaceContext` does not exist as a file in the source branch; no action required.

### Requirement 3 — Shell Components and UI Primitives

Copy order respects the dependency graph (primitives before consumers):
1. `button.tsx` (depends only on npm packages + `cn`)
2. `scroll-area.tsx` (depends only on npm packages + `cn`)
3. `theme-provider.tsx` (no local deps)
4. `mode-toggle.tsx` (depends on `theme-provider` + `button.tsx` + `DropdownMenu`)
5. `TopBar.tsx` (depends on `button.tsx`, `mode-toggle.tsx`, `Badge`, `DropdownMenu`, `useAuth`)
6. `MenuPane.tsx` (depends on `scroll-area.tsx`, `cn`, `useAuth`)
7. `AppShell.tsx` (depends on `TopBar`, `MenuPane`)

All dependencies (`Badge`, `DropdownMenu`, `cn`, `useAuth`) already exist in the working branch.

### Requirement 4 — LVEWorkspaceLayout Rename and Replacement

**Step 1 — Create legacy file:**
Write `src/components/layout/LVEWorkspaceLayoutLegacy.tsx` with the current working branch
content, renaming:
- `export interface LVETab` → `export interface LVETabLegacy`
- `export interface LVEWorkspaceLayoutProps` → `export interface LVEWorkspaceLayoutLegacyProps`
- `export const LVEWorkspaceLayout` → `export const LVEWorkspaceLayoutLegacy`

**Step 2 — Update import sites:**
Four files import from `../components/layout/LVEWorkspaceLayout`:
- `src/pages/lead-management.tsx` — change import path and symbol names to Legacy variants
- `src/pages/accounts.tsx` — same
- `src/pages/contacts.tsx` — same
- `src/pages/leads.tsx` — same

**Step 3 — Write new LVEWorkspaceLayout:**
Copy source branch `LVEWorkspaceLayout.tsx` verbatim. The source version uses CSS variable
tokens (`bg-background`, `border-border`, `text-foreground`, `bg-card`, `bg-muted`,
`text-muted-foreground`, `text-primary`, `border-primary`) which require the CSS variables
defined in the merged `index.css`.

**Step 4 — Delete old file:**
Remove the original `src/components/layout/LVEWorkspaceLayout.tsx` (now replaced by the legacy
file and the new source copy).

### Requirement 5 — App.tsx Provider Integration

The working branch `App.tsx` is missing only `ThemeProvider`. The source branch wraps the entire
tree with `ThemeProvider defaultTheme="light" storageKey="atx-ui-theme"` as the outermost
provider. Update the working branch `App.tsx` to:
1. Add `import { ThemeProvider } from './components/theme-provider';`
2. Wrap the existing `<AzureAuthProvider>` tree with `<ThemeProvider defaultTheme="light" storageKey="atx-ui-theme">`.

All five existing providers (`AzureAuthProvider`, `AuthProvider`, `AzureAuthWrapper`,
`AppProvider`, `ToastProvider`) and their nesting order are preserved unchanged.

### Requirement 6 — AppRouter.tsx Scoped AppShell Wrapping

The working branch `/lead-management` route currently wraps `LeadManagementModule` with
`<AppLayout activeSection="lead-management">`. Replace `AppLayout` with `AppShell` for this
route only:

```tsx
// Before
<AppLayout activeSection="lead-management">
  <LeadManagementModule />
</AppLayout>

// After
<AppShell>
  <LeadManagementModule />
</AppShell>
```

Add `import { AppShell } from './components/layout/AppShell';` to the imports.
All other routes (`/service-delivery-overview`, `/ejp-transaction-dashboard`, `/chat-support`,
etc.) remain exactly as they are, still using `AppLayout`.

### Requirements 7 & 8 — Diagnostics and Path Safety

- Every file write is preceded by a path prefix check (`C:\Users\githi\OneDrive\Pictures\`).
- `getDiagnostics` is run on each file immediately after writing.
- Any reported errors are fixed before the next step.
- A final `getDiagnostics` pass covers all modified files.
- A migration audit summary lists every written path with prefix confirmation.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Path Safety Invariant

*For any* file write performed during the migration, the absolute target path must begin with
`C:\Users\githi\OneDrive\Pictures\` and must not begin with `C:\Users\githi\OneDrive\Desktop\`.

**Validates: Requirements 1.4, 2.5, 3.7, 8.1, 8.2, 8.4**

### Property 2: Dependency Closure

*For any* file copied from the source branch into the working branch, every relative import
statement in that file must resolve to an existing file in the working branch after the migration
step that copies it completes.

**Validates: Requirements 2.4, 3.6**

### Property 3: Tailwind Config Merge Preserves Content Array

*For any* valid working branch `tailwind.config.js` that defines a `content` array, the merged
output must contain that same `content` array unchanged, and must additionally contain all
`theme.extend` keys present in the source branch config.

**Validates: Requirements 1.1, 1.3**

### Property 4: CSS Merge Preserves Existing Import Directives

*For any* working branch `index.css` that contains `@import 'tailwindcss/...'` directives, the
merged output must contain all original import lines and must additionally contain the CSS
variable blocks (`@layer base :root { ... }`, `.dark { ... }`) from the source branch.

**Validates: Requirements 1.2**

### Property 5: Import Site Completeness

*For any* file in the working branch that previously imported `LVEWorkspaceLayout` or
`LVEWorkspaceLayoutProps` or `LVETab` from `../components/layout/LVEWorkspaceLayout`, after
migration that file must import the corresponding `Legacy`-suffixed names from
`../components/layout/LVEWorkspaceLayoutLegacy` instead.

**Validates: Requirements 4.2**

### Property 6: Existing Provider Nesting Preserved

*For any* version of `src/App.tsx` that contains the five providers
(`AzureAuthProvider`, `AuthProvider`, `AzureAuthWrapper`, `AppProvider`, `ToastProvider`),
the migrated `App.tsx` must contain all five providers in the same nesting order, with
`ThemeProvider` added as the outermost wrapper.

**Validates: Requirements 5.1, 5.3**

### Property 7: Non-Lead-Management Routes Unchanged

*For any* route in `src/AppRouter.tsx` whose path is not `/lead-management`, the route's
element structure in the migrated file must be identical to the element structure in the
pre-migration file.

**Validates: Requirements 6.2**

### Property 8: Zero Diagnostics Errors on Completion

*For any* file written or modified during the migration, running `getDiagnostics` on that file
after all migration steps are complete must return zero errors.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

---

## Error Handling

### Missing npm Dependency (`@radix-ui/react-scroll-area`)

`scroll-area.tsx` imports `@radix-ui/react-scroll-area` which is absent from the working branch
`package.json`. If this package is not added before writing `scroll-area.tsx`, TypeScript will
report a module-not-found error. Resolution: add the dependency to `package.json` and run
`npm install` as the first step of Requirement 3.

### Import Path Conflicts

`TopBar.tsx` imports `Button` from `../ui/ButtonComponent` in the source branch. However, the
source branch `button.tsx` is a different file (`../ui/button`). After copying, `TopBar.tsx`
imports from `../ui/ButtonComponent` (the existing component) — this is correct and intentional;
`TopBar` uses the existing `ButtonComponent`, not the new shadcn `button.tsx`. No path fix needed.

### Duplicate Export Names

After the rename, `LVEWorkspaceLayoutLegacy.tsx` exports `LVEWorkspaceLayoutLegacy`,
`LVEWorkspaceLayoutLegacyProps`, and `LVETabLegacy`. The new `LVEWorkspaceLayout.tsx` exports
`LVEWorkspaceLayout`, `LVEWorkspaceLayoutProps`, and `LVETab`. There is no name collision.

### CSS Import Syntax Mismatch

The working branch uses `@import 'tailwindcss/base'` (PostCSS) while the source uses
`@tailwind base` (Tailwind CLI). Both are valid for the Vite + PostCSS setup used here.
The merge strategy keeps the working branch `@import` lines and appends the source's `@layer`
blocks — no directive conflict.

### ThemeProvider `storageKey` Collision

The source branch uses `storageKey="atx-ui-theme"`. The working branch has a `DarkModeContext`
that may use a different localStorage key. These are independent — `ThemeProvider` manages the
new CSS-variable-based theme; `DarkModeContext` is not removed and continues to function for
any existing consumers.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. Unit tests verify specific examples and
integration points; property tests verify universal invariants across all inputs.

### Unit Tests (specific examples and integration)

- `theme-provider.tsx`: verify `useTheme` throws outside provider; verify `setTheme("dark")`
  adds `"dark"` class to `document.documentElement`; verify localStorage persistence.
- `mode-toggle.tsx`: render test — verify Sun/Moon icons present; verify clicking a menu item
  calls `setTheme` with the correct argument.
- `AppShell.tsx`: render test — verify `TopBar` and `MenuPane` are rendered; verify `children`
  appear inside `<main>`.
- `LVEWorkspaceLayoutLegacy.tsx`: verify it renders with the same props as the old
  `LVEWorkspaceLayout` (backward compatibility smoke test).
- `App.tsx`: verify `ThemeProvider` is the outermost element in the rendered tree.
- `AppRouter.tsx`: verify `/lead-management` route renders `AppShell`; verify
  `/ejp-transaction-dashboard` route does not render `AppShell`.

### Property-Based Tests

Property-based testing library: **fast-check** (already used in the project's test suite pattern;
compatible with Jest/Vitest).

Each property test runs a minimum of 100 iterations.

---

**Property Test 1: Path Safety Invariant**
Tag: `Feature: global-layout-integration, Property 1: path safety invariant`

```typescript
// For any string that is a valid file path, the migration write guard
// must accept paths starting with the Pictures prefix and reject all others.
fc.assert(fc.property(
  fc.string(),
  (path) => {
    const isValid = path.startsWith("C:\\Users\\githi\\OneDrive\\Pictures\\");
    expect(validateWritePath(path)).toBe(isValid);
  }
), { numRuns: 100 });
```

---

**Property Test 2: Dependency Closure**
Tag: `Feature: global-layout-integration, Property 2: dependency closure`

```typescript
// For any copied file, all relative imports must resolve in the working branch.
fc.assert(fc.property(
  fc.constantFrom(...copiedFiles),
  (filePath) => {
    const imports = extractRelativeImports(readFile(filePath));
    imports.forEach(imp => {
      expect(fileExistsInWorkingBranch(imp)).toBe(true);
    });
  }
), { numRuns: 100 });
```

---

**Property Test 3: Tailwind Config Merge Preserves Content Array**
Tag: `Feature: global-layout-integration, Property 3: tailwind config merge`

```typescript
// For any valid tailwind config with a content array, merging must preserve it.
fc.assert(fc.property(
  fc.array(fc.string(), { minLength: 1 }),
  (contentArray) => {
    const base = { content: contentArray };
    const merged = mergeTailwindConfig(base, sourceConfig);
    expect(merged.content).toEqual(contentArray);
    expect(merged.theme?.extend?.colors).toBeDefined();
  }
), { numRuns: 100 });
```

---

**Property Test 4: CSS Merge Preserves Import Directives**
Tag: `Feature: global-layout-integration, Property 4: css merge preserves imports`

```typescript
// For any CSS string containing @import tailwindcss directives,
// the merged output must contain all original @import lines.
fc.assert(fc.property(
  fc.array(fc.constantFrom(
    "@import 'tailwindcss/base';",
    "@import 'tailwindcss/components';",
    "@import 'tailwindcss/utilities';"
  ), { minLength: 1, maxLength: 3 }),
  (importLines) => {
    const baseCss = importLines.join("\n");
    const merged = mergeCss(baseCss, sourceCss);
    importLines.forEach(line => {
      expect(merged).toContain(line);
    });
    expect(merged).toContain(":root {");
    expect(merged).toContain(".dark {");
  }
), { numRuns: 100 });
```

---

**Property Test 5: Import Site Completeness**
Tag: `Feature: global-layout-integration, Property 5: import site completeness`

```typescript
// For any file that previously imported LVEWorkspaceLayout,
// after migration it must import from LVEWorkspaceLayoutLegacy.
fc.assert(fc.property(
  fc.constantFrom(...importSiteFiles),
  (filePath) => {
    const content = readFile(filePath);
    expect(content).not.toContain("from '../components/layout/LVEWorkspaceLayout'");
    expect(content).toContain("from '../components/layout/LVEWorkspaceLayoutLegacy'");
  }
), { numRuns: 100 });
```

---

**Property Test 6: Existing Provider Nesting Preserved**
Tag: `Feature: global-layout-integration, Property 6: provider nesting preserved`

```typescript
// The five existing providers must appear in the correct nesting order in App.tsx.
fc.assert(fc.property(
  fc.constant(readFile("src/App.tsx")),
  (content) => {
    const providers = [
      "ThemeProvider", "AzureAuthProvider", "AuthProvider",
      "AzureAuthWrapper", "AppProvider", "ToastProvider"
    ];
    const positions = providers.map(p => content.indexOf(`<${p}`));
    // Each provider must appear and must open before the next one
    positions.forEach((pos, i) => {
      expect(pos).toBeGreaterThan(-1);
      if (i > 0) expect(pos).toBeGreaterThan(positions[i - 1]);
    });
  }
), { numRuns: 100 });
```

---

**Property Test 7: Non-Lead-Management Routes Unchanged**
Tag: `Feature: global-layout-integration, Property 7: non-lead-management routes unchanged`

```typescript
// For any route path other than /lead-management, the element structure is unchanged.
fc.assert(fc.property(
  fc.constantFrom(...otherRoutePaths),
  (routePath) => {
    const before = extractRouteElement(beforeRouter, routePath);
    const after = extractRouteElement(afterRouter, routePath);
    expect(after).toEqual(before);
  }
), { numRuns: 100 });
```

---

**Property Test 8: Zero Diagnostics Errors on Completion**
Tag: `Feature: global-layout-integration, Property 8: zero diagnostics errors`

```typescript
// For any file written during migration, getDiagnostics must return no errors.
fc.assert(fc.property(
  fc.constantFrom(...allModifiedFiles),
  async (filePath) => {
    const diagnostics = await getDiagnostics([filePath]);
    const errors = diagnostics.filter(d => d.severity === "error");
    expect(errors).toHaveLength(0);
  }
), { numRuns: 100 });
```
