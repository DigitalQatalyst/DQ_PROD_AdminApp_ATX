# Sidebar Integration Quick Reference

## Overview

This guide shows you exactly how to add your LVE workspace module to the application sidebar navigation.

## Method 1: Module Registry (Recommended)

### Step 1: Add to Module Registry

Open `src/components/layout/workspace/moduleRegistry.tsx` and add your module to the array:

```typescript
import { contactsModule } from "@/modules/contacts/contactsModule";
import { leadsModule } from "@/modules/leads/leadsModule";
import { accountsModule } from "@/modules/accounts/accountsModule";
import { myNewModule } from "@/modules/mynew/myNewModule"; // ← Import your module

export function getLveModulesForSegment(segment: string) {
  const modules = [
    contactsModule,
    leadsModule,
    accountsModule,
    myNewModule, // ← Add your module here
  ];

  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
}
```

### Step 2: Configure Menu Settings

In your module configuration, set the menu properties:

```typescript
export const myNewModule: LVEWorkspaceModuleConfig<MyRecord> = {
  metadata: {
    id: "mynew",
    label: "My Module", // ← Shows in sidebar
    route: "/mynew",
    icon: FileText, // ← Icon in sidebar
    // ...
  },

  menu: {
    order: 15, // ← Lower = higher in sidebar
    visible: true, // ← Show in sidebar
    requiredSegments: [], // ← Optional: restrict by user segment
  },

  // ... rest of config
};
```

### Step 3: Done!

Your module will now appear in the sidebar automatically. The sidebar component reads from `getLveModulesForSegment()`.

## Method 2: Direct Sidebar Integration

If you have a custom sidebar component, integrate directly:

```typescript
// src/components/Sidebar.tsx
import { useAuth } from "@/context/AuthContext";
import { getLveModulesForSegment } from "@/components/layout/workspace/moduleRegistry";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { userSegment } = useAuth();
  const location = useLocation();

  // Get modules for current user
  const modules = getLveModulesForSegment(userSegment || "default");

  // Sort by menu order
  const sortedModules = modules
    .filter((m) => m.menu.visible)
    .sort((a, b) => a.menu.order - b.menu.order);

  return (
    <nav className="w-64 bg-gray-900 text-white">
      <div className="p-4">
        <h2 className="text-xl font-bold">Navigation</h2>
      </div>

      <ul className="space-y-1">
        {sortedModules.map((module) => {
          const Icon = module.metadata.icon;
          const isActive = location.pathname.startsWith(module.metadata.route);

          return (
            <li key={module.metadata.id}>
              <Link
                to={module.routes.base}
                className={`
                  flex items-center gap-3 px-4 py-3
                  hover:bg-gray-800 transition-colors
                  ${isActive ? "bg-gray-800 border-l-4 border-blue-500" : ""}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{module.metadata.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

## Menu Configuration Options

### `order` (number)

Controls the position in the sidebar. Lower numbers appear first.

**Common Values:**

- `10` - Primary modules (Contacts, Accounts)
- `20` - Secondary modules (Leads, Opportunities)
- `30` - Support modules (Tasks, Notes)
- `40` - Admin modules (Settings, Users)

```typescript
menu: {
  order: 15,  // Appears between primary and secondary
}
```

### `visible` (boolean)

Controls whether the module appears in the sidebar.

```typescript
menu: {
  visible: true,   // Show in sidebar
  // visible: false,  // Hide from sidebar (still accessible via URL)
}
```

### `requiredSegments` (string[] | undefined)

Restricts module visibility to specific user segments.

```typescript
menu: {
  requiredSegments: ["crm", "sales"],  // Only show to CRM and Sales users
  // requiredSegments: undefined,      // Show to all users (default)
}
```

**Example Use Cases:**

- CRM modules: `["crm", "sales"]`
- Admin modules: `["admin"]`
- Operations modules: `["operations", "support"]`
- Public modules: `undefined` or `[]`

## Complete Example

```typescript
// src/modules/products/productsModule.ts
import { LVEWorkspaceModuleConfig } from "@/components/layout/workspace";
import { Package } from "lucide-react";

export const productsModule: LVEWorkspaceModuleConfig<Product> = {
  metadata: {
    id: "products",
    label: "Products",
    singularLabel: "Product",
    pluralLabel: "Products",
    route: "/products",
    icon: Package,
    moduleType: "record",
  },

  menu: {
    order: 12, // Between Contacts (10) and Leads (20)
    visible: true, // Show in sidebar
    requiredSegments: ["sales", "ops"], // Only for Sales and Operations
  },

  routes: {
    base: "/products",
    record: (recordId) => `/products/${recordId}`,
  },

  // ... rest of configuration
};
```

```typescript
// src/components/layout/workspace/moduleRegistry.tsx
import { productsModule } from "@/modules/products/productsModule";

export function getLveModulesForSegment(segment: string) {
  const modules = [
    contactsModule, // order: 10
    productsModule, // order: 12 ← Your module
    leadsModule, // order: 20
    accountsModule, // order: 30
  ];

  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
}
```

## User Segment Filtering

### How It Works

1. User logs in with a segment (e.g., "sales")
2. `getLveModulesForSegment("sales")` is called
3. Modules are filtered:
   - No `requiredSegments` → Always shown
   - Has `requiredSegments` → Only shown if user segment matches

### Example

```typescript
// User segment: "sales"

const modules = [
  {
    id: "contacts",
    menu: { requiredSegments: undefined }, // ✅ Shown (no restriction)
  },
  {
    id: "products",
    menu: { requiredSegments: ["sales"] }, // ✅ Shown (matches "sales")
  },
  {
    id: "admin",
    menu: { requiredSegments: ["admin"] }, // ❌ Hidden (doesn't match)
  },
];

// Result: contacts and products shown, admin hidden
```

## Testing Your Sidebar Integration

### Checklist

- [ ] Module imported in `moduleRegistry.tsx`
- [ ] Module added to array in `getLveModulesForSegment()`
- [ ] `menu.visible` is `true`
- [ ] `menu.order` is set appropriately
- [ ] Icon is imported and assigned
- [ ] Routes are configured correctly
- [ ] User segment matches `requiredSegments` (if set)

### Debug Steps

1. **Module not appearing?**

   ```typescript
   // Add debug logging
   export function getLveModulesForSegment(segment: string) {
     const modules = [myNewModule];
     console.log("All modules:", modules);

     const filtered = modules.filter(
       (m) =>
         !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
     );
     console.log("Filtered modules:", filtered);

     return filtered;
   }
   ```

2. **Check user segment:**

   ```typescript
   const { userSegment } = useAuth();
   console.log("Current user segment:", userSegment);
   ```

3. **Verify module config:**
   ```typescript
   console.log("Module menu config:", myNewModule.menu);
   ```

## Common Patterns

### Pattern 1: Module Groups

Group related modules with similar order numbers:

```typescript
// CRM Group (10-19)
contactsModule: {
  menu: {
    order: 10;
  }
}
leadsModule: {
  menu: {
    order: 11;
  }
}
accountsModule: {
  menu: {
    order: 12;
  }
}

// Operations Group (20-29)
ticketsModule: {
  menu: {
    order: 20;
  }
}
tasksModule: {
  menu: {
    order: 21;
  }
}

// Admin Group (40-49)
usersModule: {
  menu: {
    order: 40;
  }
}
settingsModule: {
  menu: {
    order: 41;
  }
}
```

### Pattern 2: Role-Based Visibility

```typescript
// Admin-only module
adminModule: {
  menu: {
    requiredSegments: ["admin"],
    order: 40,
  }
}

// Multi-role module
reportsModule: {
  menu: {
    requiredSegments: ["admin", "manager", "analyst"],
    order: 30,
  }
}
```

### Pattern 3: Feature Flags

```typescript
// Conditionally add modules based on feature flags
export function getLveModulesForSegment(segment: string) {
  const modules = [contactsModule, leadsModule];

  // Add beta features
  if (import.meta.env.VITE_ENABLE_BETA_FEATURES === "true") {
    modules.push(betaModule);
  }

  return modules.filter(
    (m) =>
      !m.menu.requiredSegments || m.menu.requiredSegments.includes(segment),
  );
}
```

## Troubleshooting

### Issue: Module appears but icon is missing

**Solution:** Ensure icon is imported from lucide-react:

```typescript
import { Package } from "lucide-react"; // ✓ Correct

metadata: {
  icon: Package,  // ✓ Component reference
  // icon: "Package",  // ✗ Wrong - string instead of component
}
```

### Issue: Module appears in wrong order

**Solution:** Check order values of surrounding modules:

```typescript
// If you want your module between these:
contactsModule: {
  menu: {
    order: 10;
  }
}
leadsModule: {
  menu: {
    order: 20;
  }
}

// Set your order to:
myModule: {
  menu: {
    order: 15;
  }
} // Appears between them
```

### Issue: Module hidden for some users

**Solution:** Check `requiredSegments` configuration:

```typescript
// Too restrictive
menu: {
  requiredSegments: ["admin"],  // Only admins see it
}

// More permissive
menu: {
  requiredSegments: ["admin", "manager", "user"],  // Multiple roles
}

// No restriction
menu: {
  requiredSegments: undefined,  // Everyone sees it
}
```

## Next Steps

1. ✅ Add module to registry
2. ✅ Configure menu settings
3. ✅ Test in development
4. 📖 Read [COMPLETE_MODULE_GUIDE.md](./COMPLETE_MODULE_GUIDE.md) for full module setup
5. 📖 Read [QUICK_START.md](./QUICK_START.md) for rapid prototyping

---

**Need Help?**

- Full guide: [COMPLETE_MODULE_GUIDE.md](./COMPLETE_MODULE_GUIDE.md)
- Quick start: [QUICK_START.md](./QUICK_START.md)
- API reference: [README.md](./README.md)
- Migration: [MIGRATION.md](./MIGRATION.md)
