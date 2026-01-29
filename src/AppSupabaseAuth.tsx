/**
 * App with Supabase Authentication
 * 
 * Alternative entry point that uses Supabase Auth instead of Azure B2C.
 * To use this, update index.tsx to import from this file instead of App.tsx
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { SupabaseAuthRouter } from './SupabaseAuthRouter';

export function AppSupabaseAuth() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SupabaseAuthProvider>
          <AppProvider>
            <ToastProvider>
              <SupabaseAuthRouter />
            </ToastProvider>
          </AppProvider>
        </SupabaseAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppSupabaseAuth;
