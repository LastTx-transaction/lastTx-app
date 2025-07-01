'use client';

import { useState, useEffect, useCallback } from 'react';
import { LastTxService, WillDetails, Beneficiary } from '@/lib/lasttx-service';
import { useAuth } from './useAuth';

export function useLastTx() {
  const { user, isAuthenticated } = useAuth();
  const [wills, setWills] = useState<Record<string, WillDetails>>({});
  const [loading, setLoading] = useState(true);
  const [accountSetup, setAccountSetup] = useState(true); // Assume setup for now

  // Load account data
  const loadAccountData = useCallback(async () => {
    if (!isAuthenticated || !user.addr) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load all wills data
      const allWills = await LastTxService.getAllWills(user.addr);
      setWills(allWills);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user.addr]);

  // Setup account (simplified for now)
  const setupAccount = async (): Promise<boolean> => {
    setAccountSetup(true);
    return true;
  };

  // Create new will (single beneficiary)
  const createWill = async (
    beneficiaryAddress: string,
    percentage: number,
    inactivityDuration: number,
    beneficiaryName: string = '',
    personalMessage: string = '',
  ): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      setLoading(true);
      await LastTxService.createWill(
        beneficiaryAddress,
        percentage,
        inactivityDuration,
        beneficiaryName,
        personalMessage,
      );
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error creating will:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Claim will
  const claimWill = async (
    ownerAddress: string,
    willId: string,
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      await LastTxService.claimWill(ownerAddress, willId);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error claiming will:', error);
      return false;
    }
  };

  // Send activity pulse
  const sendActivityPulse = async (willId: string): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      await LastTxService.sendActivityPulse(willId);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error sending activity pulse:', error);
      return false;
    }
  };

  // Update existing will (single beneficiary)
  const updateWill = async (
    willId: string,
    inactivityDuration: number,
    beneficiaryAddress: string,
    beneficiaryPercentage: number,
    beneficiaryName: string = '',
    personalMessage: string = '',
  ): Promise<boolean> => {
    if (!isAuthenticated || !accountSetup) return false;

    try {
      setLoading(true);
      await LastTxService.updateWill(
        willId,
        inactivityDuration,
        beneficiaryAddress,
        beneficiaryPercentage,
        beneficiaryName,
        personalMessage,
      );
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error updating will:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete existing will
  const deleteWill = async (willId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await LastTxService.deleteWill(willId);
      await loadAccountData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error deleting will:', error);
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
    wills: Object.values(wills),
    willsById: wills,
    loading,
    accountSetup,
    setupAccount,
    createWill,
    claimWill,
    sendActivityPulse,
    updateWill,
    deleteWill,
    refresh,
    expiredWills: Object.values(wills).filter((will) => will.isExpired),
    activeWills: Object.values(wills).filter(
      (will) => !will.isExpired && !will.isClaimed,
    ),
    claimedWills: Object.values(wills).filter((will) => will.isClaimed),

    // Legacy compatibility for old components
    lastTxs: Object.values(wills),
    lastTxsById: wills,
    createLastTx: async (
      inactivityDuration: number,
      beneficiaries: Beneficiary[],
      personalMessage?: string,
    ): Promise<boolean> => {
      // Legacy compatibility - use first beneficiary only
      const firstBeneficiary = beneficiaries[0];
      if (!firstBeneficiary) return false;

      return await createWill(
        firstBeneficiary.address,
        firstBeneficiary.percentage,
        inactivityDuration,
        firstBeneficiary.name ?? '',
        personalMessage ?? '',
      );
    },
    updateLastTx: async (
      id: string,
      inactivityDuration: number,
      beneficiaries: Beneficiary[],
      personalMessage?: string,
    ): Promise<boolean> => {
      // Legacy compatibility - use first beneficiary only
      const firstBeneficiary = beneficiaries[0];
      if (!firstBeneficiary) return false;

      return await updateWill(
        id,
        inactivityDuration,
        firstBeneficiary.address,
        firstBeneficiary.percentage,
        firstBeneficiary.name ?? '',
        personalMessage ?? '',
      );
    },
    deleteLastTx: deleteWill,
    expiredLastTxs: Object.values(wills).filter((will) => will.isExpired),
    activeLastTxs: Object.values(wills).filter(
      (will) => !will.isExpired && !will.isClaimed,
    ),
    totalBalance: 0, // Not available in new interface
    balance: 0, // Not available in new interface
    depositFunds: async () => false, // Not implemented in new contract
    distributeFunds: async () => false, // Not implemented in new contract
  };
}
