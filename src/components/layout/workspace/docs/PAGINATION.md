# LVE Workspace Pagination

## Overview

The LVE Workspace shell includes built-in pagination that automatically displays 20 records per page in the list pane. This improves performance and user experience when working with large datasets.

## Features

- **Automatic Pagination**: Records are automatically paginated at 20 per page
- **Page Navigation**: Previous/Next buttons with current page indicator
- **Record Count**: Shows "X-Y of Z" records
- **Search Integration**: Pagination resets to page 1 when search query changes
- **Module Switching**: Pagination resets when switching between modules
- **Responsive**: Works seamlessly with all module types

## How It Works

### Automatic Behavior

1. **Records are filtered** based on search query
2. **Filtered records are paginated** into pages of 20
3. **Current page is displayed** in the list pane
4. **Pagination controls appear** at the bottom of the list pane (only if more than 20 records)

### User Experience

```
┌─────────────────────────────────────┐
│  Search: [____________]             │
│  [Filters] [New Record]             │
├─────────────────────────────────────┤
│  Record 1                           │
│  Record 2                           │
│  ...                                │
│  Record 20                          │
├─────────────────────────────────────┤
│  Showing 1-20 of 150                │
│  [Previous] 1 / 8 [Next]            │
└─────────────────────────────────────┘
```

## Implementation Details

### Constants

```typescript
const RECORDS_PER_PAGE = 20; // Fixed at 20 records per page
```

### State Management

The workspace maintains:

- `currentPage`: Current page number (1-indexed)
- `totalPages`: Total number of pages
- `filteredRecords`: All records after search filtering
- `paginatedRecords`: Current page's records (20 or fewer)

### Automatic Resets

Pagination automatically resets to page 1 when:

1. **Search query changes** - User types in search box
2. **Module changes** - User switches to a different module
3. **Records update** - Controlled records prop changes

## API Integration

### With Controlled Records (Recommended)

Pagination works seamlessly with API-backed data:

```typescript
export function MyModulePage() {
  const { data, isLoading } = useMyRecordsQuery();

  return (
    <LVEWorkspace
      module={myModule}
      records={data ?? []}  // All records from API
      state={{
        listPane: { isLoading },
      }}
      persistLocalRecords={false}
    />
  );
}
```

**Note:** The workspace handles pagination client-side. All records are passed to the workspace, which then paginates them for display.

### Server-Side Pagination (Advanced)

For very large datasets (1000+ records), you may want server-side pagination:

```typescript
export function MyModulePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyRecordsQuery({ page, limit: 20 });

  return (
    <LVEWorkspace
      module={myModule}
      records={data?.records ?? []}
      state={{
        listPane: { isLoading },
      }}
      persistLocalRecords={false}
    />
  );
}
```

**Important:** If implementing server-side pagination, you'll need to:

1. Modify the API hooks to accept page/limit parameters
2. Update the backend to support pagination
3. Consider disabling client-side pagination or adjusting the page size

## Pagination Controls

### UI Components

The pagination controls include:

1. **Record Count**: "Showing 1-20 of 150"
2. **Previous Button**: Navigate to previous page (disabled on page 1)
3. **Page Indicator**: "1 / 8" (current page / total pages)
4. **Next Button**: Navigate to next page (disabled on last page)

### Styling

Pagination controls use the same design system as the rest of the workspace:

- Border-top separator
- Muted text for counts
- Outline buttons for navigation
- Disabled state for unavailable actions

## Performance Considerations

### Client-Side Pagination

**Pros:**

- Simple implementation
- No backend changes needed
- Instant page switching
- Works with any API

**Cons:**

- All records loaded into memory
- Initial load time increases with dataset size
- Not suitable for 10,000+ records

**Best For:**

- Datasets under 1,000 records
- APIs that return all records at once
- Rapid prototyping

### Server-Side Pagination

**Pros:**

- Constant memory usage
- Fast initial load
- Scales to millions of records

**Cons:**

- Requires backend support
- More complex implementation
- Page switching requires API call

**Best For:**

- Datasets over 1,000 records
- APIs with pagination support
- Production applications with large data

## Examples

### Basic Usage (Automatic)

No configuration needed - pagination works automatically:

```typescript
<LVEWorkspace
  module={myModule}
  records={allRecords}  // Pass all records
  persistLocalRecords={false}
/>
```

### With Search

Pagination resets when user searches:

```typescript
// User types "john" in search
// → Filters records to 45 matches
// → Resets to page 1
// → Shows records 1-20 of 45
// → Pagination shows "1 / 3"
```

### With Loading State

Pagination respects loading states:

```typescript
<LVEWorkspace
  module={myModule}
  records={data ?? []}
  state={{
    listPane: {
      isLoading: true,  // Pagination hidden during load
    },
  }}
/>
```

### Empty State

Pagination hidden when no records:

```typescript
<LVEWorkspace
  module={myModule}
  records={[]}  // No records
  state={{
    listPane: {
      emptyTitle: "No records found",
    },
  }}
/>
// Pagination controls not shown
```

## Customization

### Changing Page Size

To change from 20 records per page, modify the constant in `LVEWorkspace.tsx`:

```typescript
// In LVEWorkspace.tsx
const RECORDS_PER_PAGE = 50; // Change to desired page size
```

**Note:** This is a global change affecting all modules.

### Custom Pagination UI

To implement custom pagination, use `listPaneOverride`:

```typescript
export const myModule: LVEWorkspaceModuleConfig<MyRecord> = {
  // ... other config

  listPaneOverride: (props) => {
    const [page, setPage] = useState(1);
    const pageSize = 50;  // Custom page size
    const paginatedRecords = props.filteredRecords.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return (
      <div>
        {/* Custom list rendering */}
        {paginatedRecords.map(record => (
          <div key={props.module.listPane.getRecordId(record)}>
            {props.module.listPane.getRecordLabel(record)}
          </div>
        ))}

        {/* Custom pagination controls */}
        <div>
          <button onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>
    );
  },
};
```

## Troubleshooting

### Issue: Pagination not showing

**Possible Causes:**

1. Less than 21 records (pagination only shows when needed)
2. Loading state is active
3. Error state is active

**Solution:** Pagination automatically appears when you have more than 20 records.

### Issue: Page doesn't reset on search

**Possible Causes:**

1. Custom `listPaneOverride` not handling search changes
2. Search query not being passed correctly

**Solution:** The default implementation handles this automatically. If using custom override, add:

```typescript
useEffect(() => {
  setPage(1);
}, [props.searchQuery]);
```

### Issue: Performance issues with large datasets

**Possible Causes:**

1. Too many records loaded at once (10,000+)
2. Complex rendering in list items

**Solutions:**

1. Implement server-side pagination
2. Use virtual scrolling
3. Simplify list item rendering
4. Add debouncing to search

### Issue: Page state lost on navigation

**Expected Behavior:** Page state resets when:

- Switching modules
- Changing search query
- Navigating away and back

This is intentional to provide a consistent user experience.

## Best Practices

1. **Use Client-Side Pagination** for datasets under 1,000 records
2. **Implement Server-Side Pagination** for larger datasets
3. **Don't modify RECORDS_PER_PAGE** unless you have a specific reason
4. **Test with realistic data volumes** during development
5. **Monitor performance** with large datasets
6. **Consider virtual scrolling** for very long lists
7. **Provide loading states** during data fetching

## Related Documentation

- [COMPLETE_MODULE_GUIDE.md](./COMPLETE_MODULE_GUIDE.md) - Full module setup
- [README.md](../README.md) - API reference
- [types.ts](../types.ts) - TypeScript definitions

---

**Questions?**

- Check the [Troubleshooting](#troubleshooting) section
- Review the [Examples](#examples)
- Consult the team for complex scenarios
