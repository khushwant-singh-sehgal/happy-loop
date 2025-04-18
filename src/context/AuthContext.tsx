'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// Define the AuthContext shape
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any, user: any }>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Auth state tracking
  useEffect(() => {
    // Get session from storage
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          console.log("Session loaded with user ID:", data.session.user.id);
        } else {
          console.log("No session found");
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.id);
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
      
      setIsLoading(false);
      
      // Only redirect on initial SIGNED_IN event, not on refreshes
      if (event === 'SIGNED_IN') {
        // Check if we're on the login page
        if (window.location.pathname === '/dashboard/login') {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Only redirect to login if not already there and not on landing page
        if (!window.location.pathname.includes('/dashboard/login') && 
            window.location.pathname !== '/') {
          router.push('/dashboard/login');
        }
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [router]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create new user with auth only
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        return { error, user: null };
      }

      console.log("Auth signup successful", data.user);
      
      // Return the created user without trying to insert into parents table
      // The parent record will be created later or through a migration
      return { error: null, user: data.user };
    } catch (catchError) {
      console.error('Unexpected error during signup:', catchError);
      return { 
        error: { message: 'An unexpected error occurred during signup' }, 
        user: null 
      };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/dashboard/login');
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 