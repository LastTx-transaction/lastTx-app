/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { fcl, logIn, logOut } from '@/lib/flow-config';

export interface User {
  addr?: string;
  loggedIn: boolean;
  balance?: string;
  balanceVisible?: boolean; // ✨ New field for balance visibility
}

export function useAuth() {
  const [user, setUser] = useState<User>({
    loggedIn: false,
    balanceVisible: true,
  });
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Load balance visibility preference from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('balanceVisible');
    if (savedVisibility !== null) {
      setUser((prev) => ({
        ...prev,
        balanceVisible: savedVisibility === 'true',
      }));
    }
  }, []);

  // Function to fetch FLOW balance
  const fetchBalance = async (address: string) => {
    if (!address) return '0.00';

    setBalanceLoading(true);
    try {
      const response = await fcl.query({
        cadence: `
          access(all) fun main(address: Address): UFix64 {
            let account = getAccount(address)
            return account.balance
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      return parseFloat(response).toFixed(2);
    } catch (error) {
      console.error('Error fetching FLOW balance:', error);
      return '0.00';
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = fcl.currentUser.subscribe(async (currentUser: any) => {
      const newUser = {
        addr: currentUser.addr,
        loggedIn: currentUser.loggedIn ?? false,
        balance: '0.00',
        balanceVisible: user.balanceVisible ?? true, // Preserve balance visibility state
      };

      // If user is logged in, fetch their balance
      if (newUser.loggedIn && newUser.addr) {
        const balance = await fetchBalance(newUser.addr);
        newUser.balance = balance;
      }

      setUser(newUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user.balanceVisible]);

  // Function to refresh balance manually
  const refreshBalance = async () => {
    if (user.addr && user.loggedIn) {
      const balance = await fetchBalance(user.addr);
      setUser((prev) => ({ ...prev, balance }));
    }
  };

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
      // Reset user state including balance
      setUser({ loggedIn: false, balance: '0.00' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle balance visibility
  const toggleBalanceVisibility = () => {
    setUser((prev) => {
      const newVisibility = !prev.balanceVisible;
      localStorage.setItem('balanceVisible', newVisibility.toString());
      return { ...prev, balanceVisible: newVisibility };
    });
  };

  return {
    user,
    loading,
    balanceLoading,
    signIn,
    signOut,
    refreshBalance,
    toggleBalanceVisibility,
    isAuthenticated: user.loggedIn,
  };
}
