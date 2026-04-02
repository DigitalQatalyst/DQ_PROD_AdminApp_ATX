/**
 * Mock for src/lib/client.ts
 * Used in tests to avoid import.meta.env issues
 */

export const setSupabaseUserContext = jest.fn();
export const clearSupabaseUserContext = jest.fn();
export const supabase = {
  auth: {
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};
