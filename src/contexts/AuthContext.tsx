import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, Wallet } from '../types/database';

type UserProfile = Profile;
type UserWallet = Wallet;

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  wallet: UserWallet | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userType: 'worker' | 'client') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    wallet: null,
    session: null,
    loading: true,
    error: null,
  });

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  const fetchWallet = async (userId: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
    return data;
  };

  const createWallet = async (userId: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .insert({ user_id: userId })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession?.user) {
          const profile = await fetchProfile(initialSession.user.id);
          let wallet = await fetchWallet(initialSession.user.id);

          if (!wallet && profile) {
            wallet = await createWallet(initialSession.user.id);
          }

          setState({
            user: initialSession.user,
            profile,
            wallet,
            session: initialSession,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, error: 'Failed to initialize authentication' }));
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      (async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          let wallet = await fetchWallet(session.user.id);

          if (!wallet && profile) {
            wallet = await createWallet(session.user.id);
          }

          setState({
            user: session.user,
            profile,
            wallet,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            wallet: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userType: 'worker' | 'client') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            user_type: userType,
          },
        },
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      if (data.user) {
        const referralCode = new URLSearchParams(window.location.search).get('ref');
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          user_type: userType,
          referred_by: referralCode || null,
        });

        await createWallet(data.user.id);
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error: error.message };
      }

      // If onAuthStateChange hasn't fired yet, update state directly from the response
      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        let wallet = await fetchWallet(data.user.id);
        if (!wallet && profile) {
          wallet = await createWallet(data.user.id);
        }
        setState({
          user: data.user,
          profile,
          wallet,
          session: data.session,
          loading: false,
          error: null,
        });
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      wallet: null,
      session: null,
      loading: false,
      error: null,
    });
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) return { error: error.message };

      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  };

  const refreshWallet = async () => {
    if (!state.user) return;
    const wallet = await fetchWallet(state.user.id);
    setState(prev => ({ ...prev, wallet }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
