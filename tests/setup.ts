/**
 * Test Setup Configuration
 * 
 * This file configures the test environment for RLS validation tests and component tests.
 */

import '@testing-library/jest-dom';
import * as fc from 'fast-check';

// Mock modules that use import.meta
jest.mock('../src/lib/client');
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));
jest.mock('../src/context/LVEWorkspaceContext', () => ({
  useLVEWorkspace: () => ({
    tenantId: 'test-tenant',
    streamId: 'test-stream',
  }),
  LVEWorkspaceProvider: ({ children }: any) => children,
}));

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Mock import.meta for Vite compatibility
global.importMeta = {
  env: {
    VITE_COMMUNITY_SUPABASE_URL: 'https://test.supabase.co',
    VITE_COMMUNITY_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_AZURE_CLIENT_ID: 'test-client-id',
    VITE_AZURE_TENANT_ID: 'test-tenant-id',
    VITE_AZURE_REDIRECT_URI: 'http://localhost:3000',
    VITE_AUTH_MODE: 'internal',
  },
};

// Configure fast-check for property-based testing
// Minimum 100 iterations per property test as per requirements
fc.configureGlobal({
  numRuns: 100, // Minimum iterations per property test
  verbose: false,
  seed: Date.now(), // Use current time as seed for reproducibility
});

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Only show console output for test results and important messages
global.console = {
  ...console,
  log: (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('✅') || message.includes('❌') || message.includes('📊') || message.includes('🧪')) {
      originalConsoleLog(...args);
    }
  },
  warn: (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('⚠️') || message.includes('Error')) {
      originalConsoleWarn(...args);
    }
  },
  error: originalConsoleError,
};

// Global test timeout
jest.setTimeout(30000);
