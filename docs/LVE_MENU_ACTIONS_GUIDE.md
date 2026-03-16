# LVE Menu Actions Testing Guide

## Overview

Each menu item in the CRM sidebar now has comprehensive test data that demonstrates different filtering capabilities. This guide shows you how to navigate and test each action.

## How to Access Test Data

### 1. Navigate to LVE Demo

- Go to `/lve-demo` in your browser
- Or click on "LVE Demo" in the sidebar under the Demo section

### 2. Use Sidebar Menu Actions

Each CRM module (Contacts, Leads, Accounts) has expandable actions that filter the data:

## Leads Module Actions

### Data Filters

- **All Leads** (17 total) - Shows all lead records
- **Qualified** (3 records) - Leads that passed qualification criteria
- **Contacted** (3 records) - Leads that have been contacted
- **Opportunity** (2 records) - Leads ready for proposals
- **New Leads** (2 records) - Recently added, unprocessed leads
- **Closed Leads** (2 records) - Successfully closed deals
- **High Value** (5 records) - Leads worth $30,000+
- **Recent Activity** (3 records) - Leads with activity in last 7 days

### Action Tools

- **New Lead** - Create new lead (placeholder)
- **Import Leads** - Bulk import (placeholder)
- **Lead Conversion** - Conversion tools (placeholder)

## Contacts Module Actions

### Data Filters

- **All Contacts** (12 total) - Shows all contact records
- **Active Contacts** (7 records) - Currently active contacts
- **Inactive Contacts** (1 record) - Inactive/churned contacts
- **Prospects** (4 records) - Potential customers being evaluated
- **Recent Activity** (3 records) - Contacts with activity in last 7 days

### Action Tools

- **New Contact** - Create new contact (placeholder)
- **Import Contacts** - Bulk import (placeholder)
- **Quick Create** - Fast contact creation (placeholder)

## Accounts Module Actions

### Data Filters

- **All Accounts** (13 total) - Shows all account records
- **Customers** (6 records) - Existing paying customers
- **Prospects** (5 records) - Potential customers
- **Partners** (1 record) - Strategic partners
- **Active Accounts** (13 records) - Currently active accounts
- **High Value** (6 records) - Accounts with $2M+ revenue
- **Recent Activity** (3 records) - Accounts with activity in last 7 days
- **Enterprise** (2 records) - Enterprise-size accounts
- **Large Accounts** (4 records) - Large-size accounts

### Action Tools

- **New Account** - Create new account (placeholder)
- **Import Accounts** - Bulk import (placeholder)

## Testing Instructions

### Step 1: Navigate to Demo

1. Open the application
2. Click "LVE Demo" in the sidebar (under Demo section)
3. You'll see the demo page with module switcher

### Step 2: Test Menu Actions

1. In the sidebar, expand "CRM Modules"
2. Expand any module (Contacts, Leads, or Accounts)
3. Click the chevron next to the module to see actions
4. Click any filter action (e.g., "Qualified", "High Value", etc.)
5. The demo page will update to show filtered data

### Step 3: Verify Filtering

- Check the "Active Filter" indicator at the top
- Verify the "Showing X records" count matches the filter
- Browse the filtered records in the list pane
- Use "Clear Filter" button to return to "All" view

## Data Characteristics

### Leads Data

- Mix of statuses: new, contacted, qualified, opportunity, closed
- Value range: $5,000 - $95,000
- Various sources: Website, LinkedIn, Trade Show, Referral, Cold Call
- Recent activity dates for testing time-based filters

### Contacts Data

- Different statuses: active, inactive, prospect
- Various departments: Engineering, Product, Technology, Operations, Finance, Marketing
- Mix of seniority levels: VP, Director, CTO, CFO, Manager
- Recent contact dates for activity-based filtering

### Accounts Data

- Account types: customer, prospect, partner
- Size categories: small, medium, large, enterprise
- Revenue range: $150,000 - $12,000,000
- Various industries: Technology, Healthcare, Finance, Retail, Manufacturing, Energy
- Recent activity for time-based filters

## URL Parameters

The system uses URL parameters to maintain state:

- `?module=leads&filter=qualified` - Shows qualified leads
- `?module=contacts&filter=active` - Shows active contacts
- `?module=accounts&filter=enterprise` - Shows enterprise accounts

You can bookmark specific filtered views or share URLs with teammates.

## Next Steps

This foundation supports:

- Adding more sophisticated filters
- Implementing search functionality
- Adding sorting capabilities
- Creating saved filter sets
- Building custom dashboards
