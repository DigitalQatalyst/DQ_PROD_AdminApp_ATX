# LVE Workspace System

A config-driven, reusable List | View | Edit workspace system for ATX Admin Platform.

## Overview

The LVE system provides a standardized workspace layout that can be configured for different modules without writing custom UI code. Teams only need to provide configuration objects and data to get a fully functional workspace.

## Architecture

### Core Components

1. **LVEWorkspaceLayout** - Dumb shell component that handles layout only
2. **LVEWorkspace** - Smart orchestrator that manages state and renders configured components
3. **Individual Renderers** - Default components for each pane (Header, Tabs, List, Work, Pop)

### Key Features

- **Config-driven**: No custom JSX required for normal usage
- **Type-safe**: Full TypeScript support with generic record types
- **Reusable**: Same components work for any module
- **Flexible**: Override props available as escape hatches
- **Built-in states**: Loading, error, empty states included
- **Responsive**: Configurable pane widths and collapsible sections

## Usage

### Basic Example

```tsx
import { LVEWorkspace } from "../components/lve";
import { leadsConfig } from "../components/lve/configs/leadsConfig";
import { mockLeads } from "../components/lve/mock/mockData";

function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState();

  return (
    <LVEWorkspace
      config={leadsConfig}
      records={mockLeads}
      selectedRecord={selectedLead}
      onRecordSelect={setSelectedLead}
    />
  );
}
```

### Configuration Structure

```tsx
const moduleConfig: LVEWorkspaceConfig = {
  moduleId: "leads",
  title: "Lead Management",

  // Optional tabs
  tabs: [
    { id: "all", label: "All Leads", isActive: true },
    { id: "qualified", label: "Qualified", isDirty: true }
  ],

  // List pane configuration
  listPane: {
    columns: [
      {
        id: "name",
        label: "Name",
        field: "name",
        sortable: true,
        render: (value, record) => <CustomRenderer value={value} />
      }
    ],
    filters: [...],
    searchable: true,
    config: { width: 350, collapsible: true }
  },

  // Work pane configuration
  workPane: {
    sections: [
      {
        id: "basic-info",
        title: "Basic Information",
        fields: [...],
        collapsible: true
      }
    ],
    actions: [
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        variant: "primary",
        onClick: (record) => handleEdit(record)
      }
    ]
  },

  // Optional pop pane
  popPane: {
    sections: [...],
    config: { width: 300, collapsible: true }
  }
};
```

## Available Components

### LVEWorkspace Props

```tsx
interface LVEWorkspaceProps<T extends LVERecord> {
  config: LVEWorkspaceConfig;
  records: T[];
  selectedRecord?: T;
  loading?: boolean;
  error?: string;

  // Event handlers
  onRecordSelect?: (record: T) => void;
  onRecordUpdate?: (record: T) => void;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSort?: (field: string, direction: "asc" | "desc") => void;

  // Override props (escape hatches)
  overrides?: {
    listPane?: React.ReactNode;
    workPane?: React.ReactNode;
    popPane?: React.ReactNode;
  };
}
```

### Configuration Types

- **LVEColumn**: List column definition with optional custom renderers
- **LVEFilter**: Filter configuration for list pane
- **LVESection**: Work/pop pane section with fields
- **LVEField**: Individual field definition with type and rendering
- **LVEAction**: Button actions with handlers and styling
- **LVETab**: Tab definition with state management

## Mock Data & Testing

The system includes comprehensive mock data for testing:

- **mockLeads**: 5 lead records with various statuses
- **mockContacts**: 3 contact records with different roles
- **mockAccounts**: 3 account records with different types

### Demo Page

Visit `/contacts`, `/leads`, or `/accounts` to see the shared LVE shell in action:

- Switch between Leads, Contacts, and Accounts
- Test selection, filtering, and actions
- See different configurations in use

## Example Configurations

### Leads Module

- Status-based filtering and rendering
- Value formatting with currency
- Activity timeline in pop pane
- Lead conversion actions

### Contacts Module

- Professional information sections
- Email/phone click-to-action links
- Department-based filtering
- Contact interaction history

### Accounts Module

- Revenue and size-based categorization
- Website and address rendering
- Account type workflows
- Related contacts integration

## Extending the System

### Custom Renderers

```tsx
// In field configuration
render: (value, record) => (
  <div className="custom-renderer">
    <Icon className="w-4 h-4" />
    <span>{formatValue(value)}</span>
  </div>
);
```

### Override Components

```tsx
<LVEWorkspace
  config={config}
  records={records}
  overrides={{
    workPane: <CustomWorkPane selectedRecord={selected} />,
  }}
/>
```

### Custom Actions

```tsx
actions: [
  {
    id: "custom-action",
    label: "Custom Action",
    icon: CustomIcon,
    variant: "primary",
    onClick: (record) => {
      // Custom logic here
      console.log("Custom action for:", record);
    },
  },
];
```

## Best Practices

1. **Keep configs declarative** - Avoid complex logic in render functions
2. **Use type-safe records** - Extend LVERecord for your data types
3. **Leverage built-in states** - Use loading/error props instead of custom handling
4. **Configure, don't customize** - Use config options before override props
5. **Test with mock data** - Use provided mock data for development and testing

## Migration from Old System

The old slot-based LVEWorkspaceLayout is still available but deprecated:

```tsx
// Old way (deprecated)
<LVEWorkspaceLayout
  listPane={<CustomListPane />}
  workPane={<CustomWorkPane />}
/>

// New way (recommended)
<LVEWorkspace
  config={moduleConfig}
  records={data}
/>
```

## Performance Considerations

- **Memoize render functions** for large datasets
- **Use pagination** for lists with 100+ records
- **Lazy load sections** for complex work panes
- **Debounce search/filters** for better UX

## Support

For questions or issues with the LVE system:

1. Check existing configurations in `/configs/` folder
2. Review mock data examples in `/mock/` folder
3. Test functionality in the shared module pages at `/contacts`, `/leads`, or `/accounts`
4. Refer to type definitions in `/types.ts`
