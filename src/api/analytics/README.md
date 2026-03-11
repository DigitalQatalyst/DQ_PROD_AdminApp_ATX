# Analytics API Services

This directory contains centralized API services for the analytics backend.

## Configuration

All API endpoints are centralized in `config.ts` to avoid repetition and make maintenance easier.

### Base URL
```typescript
export const API_BASE_URL = 'https://kf-analytics-server.vercel.app/api';
```

### Available Endpoints

#### Products API
- `API_ENDPOINTS.products.all` - Get all products
- `API_ENDPOINTS.products.marketplace.filter` - Filter products by marketplace type
- `API_ENDPOINTS.products.marketplace.metadata` - Get marketplace metadata
- `API_ENDPOINTS.products.serviceType.filter` - Filter products by service type
- `API_ENDPOINTS.products.serviceType.metadata` - Get service type metadata

#### Profiles API
- `API_ENDPOINTS.profiles.businessSize.filter` - Filter profiles by business size
- `API_ENDPOINTS.profiles.businessSize.metadata` - Get business size metadata

#### Accounts API
- `API_ENDPOINTS.accounts.region.metadata` - Get region metadata
- `API_ENDPOINTS.accounts.providers.completionTime` - Get provider completion time
- `API_ENDPOINTS.accounts.providers.requestsTracking` - Get provider requests tracking
- `API_ENDPOINTS.accounts.providers.benchmarkSummary` - Get provider benchmark summary

#### Incidents API
- `API_ENDPOINTS.incidents.partners.avgResponseTime` - Get average response time
- `API_ENDPOINTS.incidents.partners.avgCompletionTime` - Get average completion time

#### Analytics API
- `API_ENDPOINTS.analytics.slaCompliance.trend` - Get SLA compliance trend
- `API_ENDPOINTS.analytics.providerRetentionKpi` - Get provider retention KPI

#### SLA KPI API
- `API_ENDPOINTS.slaKpi.breachRate` - Get SLA breach rate

## Usage

### Import the configuration
```typescript
import { API_ENDPOINTS, buildUrl } from './config';
```

### Using endpoints directly
```typescript
const response = await fetch(API_ENDPOINTS.products.all);
```

### Using endpoints with query parameters
```typescript
const url = buildUrl(API_ENDPOINTS.products.marketplace.filter, { type: '123950000' });
const response = await fetch(url);
```

### Using service classes
```typescript
import ProductsService from '@/api/analytics/products';
import ProfilesService from '@/api/analytics/profiles';
import IncidentsService from '@/api/analytics/incidents';
import AccountsService from '@/api/analytics/accounts';

// Get all products
const products = await ProductsService.getAllProducts();

// Get filtered products
const financialProducts = await ProductsService.getMarketplaceProducts('123950000');

// Get business sizes
const sizes = await ProfilesService.getBusinessSizes();

// Get incident metrics
const avgResponseTime = await IncidentsService.getAvgResponseTime();

// Get account metrics
const slaCompliance = await AccountsService.getSlaComplianceTrend();
```

## Services

### ProductsService (`products.ts`)
Handles all product-related API calls:
- `getAllProducts()` - Fetch all products
- `getMarketplaceProducts(type?)` - Filter by marketplace type
- `getFinancialProducts()` - Get financial products (type: 123950001)
- `getNonFinancialProducts()` - Get non-financial products (type: 123950000)
- `getServiceTypes()` - Get service type options for dropdowns
- `getSubServiceTypes()` - Get sub-service type options
- `getSubServiceProducts(type?)` - Filter by sub-service type
- `getRegions()` - Get region options

### ProfilesService (`profiles.ts`)
Handles all profile-related API calls:
- `getBusinessSizes()` - Get business size options for dropdowns
- `getBusinessProfilesBySize(size)` - Filter profiles by business size

### IncidentsService (`incidents.ts`)
Handles all incident-related API calls:
- `getAvgResponseTime()` - Get average response time for partners
- `getAvgCompletionTime()` - Get average completion time for partners

### AccountsService (`accounts.ts`)
Handles all account-related API calls:
- `getSlaComplianceTrend()` - Get SLA compliance trend data
- `getProviderSlaBreachRate()` - Get provider SLA breach rates
- `getProviderCompletionTime()` - Get provider completion times
- `getProviderRequestsTracking(filters?)` - Get provider request tracking with filters
- `getProviderBenchmarkSummary()` - Get provider benchmark summary
- `getProviderRetentionKpi()` - Get provider retention KPI

## Helper Functions

### buildUrl(baseUrl, params?)
Builds a URL with query parameters, automatically filtering out undefined/null values.

```typescript
// Example
const url = buildUrl(API_ENDPOINTS.products.marketplace.filter, { 
  type: '123950000',
  category: undefined // This will be filtered out
});
// Result: https://kf-analytics-server.vercel.app/api/products/marketplace/filter?type=123950000
```

## Benefits of Centralization

1. **Single Source of Truth** - All endpoints defined in one place
2. **Easy Maintenance** - Change the base URL once, affects all services
3. **Type Safety** - TypeScript ensures correct endpoint usage
4. **Consistency** - All services use the same URL building logic
5. **Testability** - Easy to mock endpoints for testing
6. **Documentation** - Clear overview of all available endpoints

## Migration Guide

If you find hardcoded URLs in the codebase:

### Before
```typescript
const url = `https://kf-analytics-server.vercel.app/api/products/marketplace/filter?type=${type}`;
const response = await fetch(url);
```

### After
```typescript
import { API_ENDPOINTS, buildUrl } from '@/api/analytics/config';

const url = buildUrl(API_ENDPOINTS.products.marketplace.filter, { type });
const response = await fetch(url);
```

Or better yet, use the service:
```typescript
import ProductsService from '@/api/analytics/products';

const products = await ProductsService.getMarketplaceProducts(type);
```
