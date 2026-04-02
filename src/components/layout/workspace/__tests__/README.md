# LVE Workspace Property-Based Testing

This directory contains property-based tests for the LVE Workspace shell refinement feature.

## Overview

Property-based testing validates universal properties that should hold for all valid inputs, providing more comprehensive coverage than example-based unit tests alone.

## Test Files

### Property-Based Tests

- **LVEWorkspace.properties.test.tsx** - Property tests for the main workspace orchestrator
- **LVEWorkspaceLayout.properties.test.tsx** - Property tests for the shell layout component

### Unit Tests

- **LVEWorkspace.controlled-records.test.tsx** - Unit tests for controlled records behavior
- **LVEWorkspace.crud-handlers.test.tsx** - Unit tests for CRUD handler integration

### Test Utilities

- **generators.ts** - Fast-check generators for creating random test data
- **test-utils.tsx** - Common test utilities and helpers

## Configuration

### Fast-Check Setup

Property-based tests are configured in `tests/setup.ts` with:

- **Minimum 100 iterations** per property test (as per requirements)
- **Seed-based randomization** for reproducibility
- **Verbose mode disabled** to reduce noise

### Test Environment

- **Test framework**: Jest with ts-jest
- **React testing**: @testing-library/react
- **Property testing**: fast-check
- **Test environment**: jsdom (for React component testing)

## Running Tests

```bash
# Run all workspace tests
npm test -- src/components/layout/workspace

# Run only property tests
npm test -- src/components/layout/workspace/__tests__/*.properties.test.tsx

# Run with coverage
npm test -- --coverage src/components/layout/workspace

# Run specific test file
npm test -- src/components/layout/workspace/__tests__/LVEWorkspace.properties.test.tsx
```

## Property Test Structure

Each property test follows this structure:

```typescript
describe("Property N: Property Name", () => {
  it("**Validates: Requirements X.Y, Z.W** - should maintain property", () => {
    fc.assert(
      fc.property(arbGenerator(), (input) => {
        // Test logic
        expect(result).toSatisfyProperty();
      }),
    );
  });
});
```

### Key Elements

1. **Feature Tag**: All tests include `Feature: lve-workspace-shell-refinement`
2. **Requirement Links**: Each test validates specific requirements using `**Validates: Requirements X.Y**`
3. **Property Number**: Tests are numbered to match the design document properties
4. **Generators**: Use generators from `generators.ts` to create random test data

## Generators

The `generators.ts` file provides fast-check generators for:

### Basic Types

- `arbModuleType()` - Random module type (record, workflow, parent-workspace)
- `arbActionVariant()` - Random action variant
- `arbActionIntent()` - Random action intent
- `arbCrudFieldType()` - Random CRUD field type
- `arbIconComponent()` - Random icon component
- `arbId()` - Random UUID
- `arbLabel()` - Random label string
- `arbRoutePath()` - Random route path

### Record Types

- `arbContactRecord()` - Random ContactRecord
- `arbLeadRecord()` - Random LeadRecord
- `arbAccountRecord()` - Random AccountRecord
- `arbGenericRecord()` - Random generic record with ID

### Configuration Types

- `arbModuleMetadata()` - Random module metadata
- `arbMenuRegistration()` - Random menu registration
- `arbRouteConfig()` - Random route configuration
- `arbActionDefinition()` - Random action definition
- `arbListColumn()` - Random list column
- `arbCrudFieldDefinition()` - Random CRUD field definition
- `arbCrudConfig()` - Random CRUD configuration

### Pane Configuration

- `arbListPaneConfig()` - Random list pane configuration
- `arbWorkWindowConfig()` - Random work window configuration
- `arbPopPaneConfig()` - Random pop pane configuration

### Complete Module

- `arbModuleConfig()` - Random complete module configuration

### Runtime State

- `arbRuntimeState()` - Random runtime state

### CRUD Operations

- `arbCreateContext()` - Random create operation context
- `arbUpdateContext()` - Random update operation context
- `arbDeleteContext()` - Random delete operation context

## Test Utilities

The `test-utils.tsx` file provides:

- `TestWrapper` - React component that provides routing context
- `renderWithRouter()` - Custom render function with routing
- `mockLocalStorage()` - Mock localStorage for testing
- `mockSessionStorage()` - Mock sessionStorage for testing
- `waitForAsync()` - Wait for async operations
- `createMockFn()` - Create mock function that tracks calls

## Properties Tested

The property-based tests validate 40 properties from the design document:

### Module Configuration (Properties 1-3)

- Property 1: Module type support through configuration
- Property 2: Pane override invocation
- Property 3: Override context completeness

### State Management (Properties 4-10)

- Property 4: Runtime state immutability
- Property 5: Controlled records authority
- Property 6: No persistence of controlled records
- Property 7: Record removal handling
- Property 8: Search immutability
- Property 9: Runtime state override precedence
- Property 10: Independent pane state

### CRUD Operations (Properties 11-17)

- Property 11: Create handler context
- Property 12: Update handler context
- Property 13: Delete handler context
- Property 14: Async CRUD loading states
- Property 15: CRUD error display
- Property 16: Create success navigation
- Property 17: Delete success navigation

### Module Registry (Property 18)

- Property 18: Segment-based module filtering

### Routing and Tabs (Properties 19-21, 26-29)

- Property 19: Route-based tab opening
- Property 20: Tab state persistence
- Property 21: Route support
- Property 26: Tab opening on selection
- Property 27: Tab close navigation
- Property 28: No duplicate tabs
- Property 29: Dirty state indicators

### Legacy Components (Property 22)

- Property 22: Legacy component warnings

### Search and Filtering (Properties 23-24)

- Property 23: Search filtering
- Property 24: Search placeholder rendering

### UI States (Property 25)

- Property 25: State-driven UI rendering

### Pop Pane (Properties 30-32)

- Property 30: Collapsible pop pane controls
- Property 31: Collapse state persistence
- Property 32: Grid column adjustment

### Actions (Properties 33-36)

- Property 33: Action context passing
- Property 34: Intent-based modal opening
- Property 35: Action disabled state
- Property 36: Action variant rendering

### Module Tabs (Properties 37-39)

- Property 37: Module tab rendering
- Property 38: Module tab navigation
- Property 39: Active module tab highlighting

### Persistence (Property 40)

- Property 40: Local persistence control

## Best Practices

1. **Use Generators**: Always use generators from `generators.ts` for consistent test data
2. **Test Properties, Not Examples**: Focus on universal properties that hold for all inputs
3. **Keep Tests Focused**: Each test should validate one property
4. **Document Requirements**: Always link tests to requirements using `**Validates: Requirements X.Y**`
5. **Avoid Mocking**: Test real functionality when possible; only mock external dependencies
6. **Check Immutability**: Verify that operations don't mutate input data
7. **Test Edge Cases**: Generators should include edge cases (empty arrays, null values, etc.)

## Troubleshooting

### Tests Failing Due to Import Errors

If tests fail with import.meta errors, ensure:

- `tests/setup.ts` includes mocks for Vite-specific modules
- `jest.config.cjs` has correct moduleNameMapper configuration
- Manual mocks exist in `src/lib/__mocks__/` for problematic modules

### Tests Timing Out

If property tests timeout:

- Check that async operations are properly awaited
- Verify that generators don't create excessively large data structures
- Consider reducing numRuns in fast-check configuration for debugging

### Flaky Tests

If tests are flaky:

- Check for race conditions in async code
- Verify that tests clean up after themselves (localStorage, sessionStorage)
- Use the seed value from failed test runs to reproduce issues

## Contributing

When adding new property tests:

1. Add generators to `generators.ts` if needed
2. Create test in appropriate `.properties.test.tsx` file
3. Link test to design document property number
4. Document validated requirements using `**Validates: Requirements X.Y**`
5. Ensure test runs with minimum 100 iterations
6. Add property description to this README
