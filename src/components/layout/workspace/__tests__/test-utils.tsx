/**
 * Test Utilities for LVE Workspace Testing
 *
 * Common utilities and helpers for property-based and unit tests.
 */

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Wrapper component that provides routing context for tests
 */
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <BrowserRouter>{children}</BrowserRouter>;

/**
 * Custom render function that includes routing context
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

/**
 * Mock sessionStorage for testing
 */
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create a mock function that tracks calls
 */
export const createMockFn = <T extends (...args: any[]) => any>() => {
  const calls: Parameters<T>[] = [];
  const fn = ((...args: Parameters<T>) => {
    calls.push(args);
  }) as T & { calls: Parameters<T>[] };
  fn.calls = calls;
  return fn;
};
