/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { fcl, logIn, logOut } from '@/lib/flow-config';

export interface User {
  addr?: string;
  loggedIn: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User>({ loggedIn: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = fcl.currentUser.subscribe((currentUser: any) => {
      setUser({
        addr: currentUser.addr,
        loggedIn: currentUser.loggedIn ?? false,
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await logIn();
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      logOut(); // FCL unauthenticate is not async
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: user.loggedIn,
  };
}
