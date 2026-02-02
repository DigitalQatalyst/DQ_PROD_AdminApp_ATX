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
  onAuthStateChange,
  AppUserProfile,
} from '../lib/supabaseAuth';
import { getSupabaseClient, setSupabaseSession } from '../lib/dbClient';
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

  const createLoginLeadIfNeeded = useCallback(async (userProfile: AppUserProfile) => {
    const ENABLE_LEAD_CAPTURE = true; // TODO: disable after testing
    if (!ENABLE_LEAD_CAPTURE) return;

    if (userProfile.user_segment !== 'internal') return;

    try {
      await setSupabaseSession();
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn('Supabase client not available for lead capture');
        return;
      }

      const { data: existingLead, error: existingError } = await supabase
        .from('crm_leads')
        .select('id, stage')
        .eq('related_user_id', userProfile.user_id)
        .not('stage', 'in', '("Converted","Disqualified")')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.warn('Failed to check existing lead:', existingError);
        return;
      }

      if (existingLead) {
        return;
      }

      const { error: insertError } = await supabase
        .from('crm_leads')
        .insert({
          contact_name: userProfile.name,
          contact_email: userProfile.email,
          organization_name: userProfile.organization_name || null,
          organization_id: null,
          related_user_id: userProfile.user_id,
          owner_id: userProfile.user_id,
          owner_name: userProfile.name,
          source: 'Login',
          stage: 'New'
        });

      if (insertError) {
        console.warn('Failed to create login lead:', insertError);
      }
    } catch (error) {
      console.warn('Lead capture failed:', error);
    }
  }, []);

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
    // No auto-login - just set loading to false
    // Users must explicitly sign in each time
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
          await createLoginLeadIfNeeded(userProfile);
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
      await createLoginLeadIfNeeded(result.profile);
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
