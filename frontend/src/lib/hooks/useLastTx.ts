'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LastTxService,
  LastTxDetails,
  Beneficiary,
} from '@/lib/lasttx-service';
import { useAuth } from './useAuth';

export function useLastTx() {
  const { user, isAuthenticated } = useAuth();
  const [lastTxs, setLastTxs] = useState<Record<string, LastTxDetails>>({});
  const [loading, setLoading] = useState(true);
  const [accountSetup, setAccountSetup] = useState(false);
  const [balance, setBalance] = useState(0);

  // Load account data
  const loadAccountData = useCallback(async () => {
    if (!isAuthenticated || !user.addr) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check account setup
      const isSetup = await LastTxService.isAccountSetup(user.addr);
      setAccountSetup(isSetup);

      if (isSetup) {
        // Load LastTx data
        const allLastTx = await LastTxService.getAllLastTx(user.addr);
        setLastTxs(allLastTx);
      }

      // Load balance
      const accountBalance = await LastTxService.getAccountBalance(user.addr);
      setBalance(accountBalance);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user.addr]);

  // Setup account
  const setupAccount = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      await LastTxService.setupAccount();
      setAccountSetup(true);
      await loadAccountData();
      return true;
    } catch (error) {
      console.error('Error setting up account:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create new LastTx
  const createLastTx = async (
    inactivityDuration: number,
    beneficiaries: Beneficiary[],
    personalMessage?: string,
  ): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      setLoading(true);
      await LastTxService.createLastTx(
        inactivityDuration,
        beneficiaries,
        personalMessage,
      );
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error creating LastTx:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Send activity pulse
  const sendActivityPulse = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      await LastTxService.sendActivityPulse(id);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error sending activity pulse:', error);
      return false;
    }
  };

  // Deposit funds
  const depositFunds = async (id: string, amount: number): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      await LastTxService.depositFunds(id, amount);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error depositing funds:', error);
      return false;
    }
  };

  // Distribute funds
  const distributeFunds = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      await LastTxService.distributeFunds(id);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error distributing funds:', error);
      return false;
    }
  };

  // Update existing LastTx
  const updateLastTx = async (
    id: string,
    inactivityDuration: number,
    beneficiaries: Beneficiary[],
    personalMessage?: string,
  ): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      setLoading(true);
      await LastTxService.updateLastTx(
        id,
        inactivityDuration,
        beneficiaries,
        personalMessage,
      );
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error updating LastTx:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete existing LastTx
  const deleteLastTx = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await LastTxService.deleteLastTx(id);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error deleting LastTx:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refresh = () => {
    loadAccountData();
  };

  // Load data when authentication changes
  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  return {
    lastTxs: Object.values(lastTxs),
    lastTxsById: lastTxs,
    loading,
    accountSetup,
    balance,
    setupAccount,
    createLastTx,
    sendActivityPulse,
    depositFunds,
    distributeFunds,
    updateLastTx,
    deleteLastTx,
    refresh,
    expiredLastTxs: Object.values(lastTxs).filter((tx) => tx.isExpired),
    activeLastTxs: Object.values(lastTxs).filter(
      (tx) => tx.isActive && !tx.isExpired,
    ),
    totalBalance: Object.values(lastTxs).reduce(
      (sum, tx) => sum + tx.balance,
      0,
    ),
  };
}
