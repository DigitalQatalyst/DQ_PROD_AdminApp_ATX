/**
 * Supabase Auth Context
 * 
 * Provides Supabase authentication that integrates with the existing AuthContext.
 * This replaces Azure B2C auth with Supabase email/password auth.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  signInWithEmail,
  signOut as supabaseSignOut,
  fetchUserProfile,
  storeUserProfileLocally,
  AppUserProfile,
} from '../lib/supabaseAuth';
import { useAuth } from './AuthContext';

interface SupabaseAuthContextType {
  supabaseUser: User | null;
  session: Session | null;
  profile: AppUserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSupabaseAuth: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the existing AuthContext login function to sync state
  const { login: authContextLogin, logout: authContextLogout } = useAuth();

  const syncWithAuthContext = useCallback(async (userProfile: AppUserProfile) => {
    // Sync with existing AuthContext for CASL abilities
    const userData = {
      id: userProfile.user_id,
      email: userProfile.email,
      name: userProfile.name || userProfile.email.split('@')[0],
      role: userProfile.role,
      organization_id: userProfile.organization_id,
      user_segment: userProfile.user_segment,
    };

    await authContextLogin(userData as any, userProfile.user_segment, userProfile.role);
  }, [authContextLogin]);

  const refreshProfile = useCallback(async () => {
    if (!supabaseUser) {
      setProfile(null);
      return;
    }

    const userProfile = await fetchUserProfile(supabaseUser.id);
    if (userProfile) {
      setProfile(userProfile);
      storeUserProfileLocally(userProfile);
      await syncWithAuthContext(userProfile);
    }
  }, [supabaseUser, syncWithAuthContext]);

  useEffect(() => {
    // START AUTH BYPASS CODE
    const bypassAuth = async () => {
      console.log('Using Auth Bypass');

      const mockUser: User = {
        id: 'bypass-user-id',
        app_metadata: {},
        user_metadata: { name: 'Dev Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'bypass-token',
        refresh_token: 'bypass-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };

      const mockProfile: AppUserProfile = {
        user_id: 'bypass-user-id',
        email: 'dev@admin.com',
        role: 'admin',
        organization_id: 'default-org-id',
        user_segment: 'internal',
        name: 'Dev Admin'
      };

      setSession(mockSession);
      setSupabaseUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);

      await syncWithAuthContext(mockProfile);
    };

    bypassAuth();
    // END AUTH BYPASS CODE

    /* ORIGINAL AUTH CODE DISABLED
    setLoading(false);

    // Subscribe to auth changes (for sign-in/sign-out events during the session)
    const { data: { subscription } } = onAuthStateChange(async (event, newSession) => {
      console.log('Supabase auth state changed:', event);
      
      // Only handle SIGNED_IN and SIGNED_OUT events, not initial session restore
      if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        setSupabaseUser(newSession.user);

        const userProfile = await fetchUserProfile(newSession.user.id);
        if (userProfile) {
          setProfile(userProfile);
          storeUserProfileLocally(userProfile);
          await syncWithAuthContext(userProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setSupabaseUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    */
  }, [syncWithAuthContext]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await signInWithEmail(email, password);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return false;
    }

    if (result.user && result.profile) {
      setSupabaseUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
      storeUserProfileLocally(result.profile);
      await syncWithAuthContext(result.profile);
    }

    setLoading(false);
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    await supabaseSignOut();
    authContextLogout();
    setSupabaseUser(null);
    setSession(null);
    setProfile(null);
    setError(null);
    setLoading(false);
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        supabaseUser,
        session,
        profile,
        loading,
        error,
        signIn,
        signOut,
        refreshProfile,
        isSupabaseAuth: true,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
