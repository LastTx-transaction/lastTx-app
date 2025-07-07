/* eslint-disable @typescript-eslint/no-explicit-any */
import { fcl } from './flow-config';
import * as TRANSACTIONS from './cadence/transactions';
import * as SCRIPTS from './cadence/scripts';

export interface Beneficiary {
  address: string;
  percentage: number;
  name?: string;
  email?: string; // Add email field
}

export interface WillDetails {
  id: string;
  owner: string;
  beneficiaries: Beneficiary[];
  inactivityDuration: number;
  lastActivity: number;
  personalMessage: string;
  isClaimed: boolean;
  isExpired: boolean;
  createdAt: number;
}

export interface CreateWillParams {
  beneficiaryAddress: string;
  percentage: number;
  inactivityDuration: number;
  beneficiaryName?: string;
  beneficiaryEmail?: string; // Add email parameter
  personalMessage?: string;
}

export class LastTxService {
  // Create new inheritance will (single beneficiary)
  static async createWill(
    beneficiaryAddress: string,
    percentage: number,
    inactivityDuration: number,
    beneficiaryName: string = '',
    personalMessage: string = '',
    beneficiaryEmail: string = '', // Change to required string parameter
  ): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.CREATE_WILL,
        args: (arg: any, t: any) => [
          arg(beneficiaryAddress, t.Address),
          arg(percentage.toFixed(8), t.UFix64),
          arg(inactivityDuration.toFixed(8), t.UFix64),
          arg(beneficiaryName, t.String),
          arg(beneficiaryEmail, t.String), // Add email to transaction args
          arg(personalMessage, t.String),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error creating will:', error);
      throw error;
    }
  }

  // Claim inheritance from a will
  static async claimWill(
    ownerAddress: string,
    willId: string,
  ): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.CLAIM_WILL,
        args: (arg: any, t: any) => [
          arg(ownerAddress, t.Address),
          arg(willId, t.UInt64),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error claiming will:', error);
      throw error;
    }
  }

  // Update existing will (single beneficiary)
  static async updateWill(
    willId: string,
    inactivityDuration: number,
    beneficiaryAddress: string,
    beneficiaryPercentage: number,
    beneficiaryName: string = '',
    beneficiaryEmail: string = '', // Add email parameter
    personalMessage: string = '',
  ): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.UPDATE_WILL,
        args: (arg: any, t: any) => [
          arg(willId, t.UInt64),
          arg(inactivityDuration.toFixed(8), t.UFix64),
          arg(beneficiaryAddress, t.Address),
          arg(beneficiaryPercentage.toFixed(8), t.UFix64),
          arg(beneficiaryName, t.String),
          arg(beneficiaryEmail, t.String), // Add email to args
          arg(personalMessage, t.String),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error updating will:', error);
      throw error;
    }
  }

  // Delete existing will
  static async deleteWill(willId: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.DELETE_WILL,
        args: (arg: any, t: any) => [arg(willId, t.UInt64)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error deleting will:', error);
      throw error;
    }
  }

  // Send activity pulse to reset timer
  static async sendActivityPulse(willId: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.SEND_ACTIVITY_PULSE,
        args: (arg: any, t: any) => [arg(willId, t.UInt64)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error sending activity pulse:', error);
      throw error;
    }
  }

  // Get all wills for an account
  static async getAllWills(
    address: string,
  ): Promise<Record<string, WillDetails>> {
    try {
      const allData = await fcl.query({
        cadence: SCRIPTS.GET_ALL_WILLS,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      const result: Record<string, WillDetails> = {};

      for (const [id, details] of Object.entries(
        allData as Record<string, any>,
      )) {
        result[id] = {
          id: details.id.toString(),
          owner: details.owner,
          beneficiaries: details.beneficiaries.map((b: any) => ({
            address: b.address,
            percentage: parseFloat(b.percentage),
            name: b.name,
          })),
          inactivityDuration: parseFloat(details.inactivityDuration),
          lastActivity: parseFloat(details.lastActivity),
          personalMessage: details.personalMessage ?? '',
          isClaimed: details.isClaimed,
          isExpired: details.isExpired,
          createdAt: parseFloat(details.createdAt),
        };
      }

      return result;
    } catch (error) {
      console.error('Error getting all wills:', error);
      return {};
    }
  }

  // Get will details
  static async getWillDetails(
    address: string,
    willId: string,
  ): Promise<WillDetails | null> {
    try {
      const details = await fcl.query({
        cadence: SCRIPTS.GET_WILL_DETAIL,
        args: (arg: any, t: any) => [
          arg(address, t.Address),
          arg(willId, t.UInt64),
        ],
      });

      if (!details) return null;

      return {
        id: details.id.toString(),
        owner: details.owner,
        beneficiaries: details.beneficiaries.map((b: any) => ({
          address: b.address,
          percentage: parseFloat(b.percentage),
          name: b.name,
        })),
        inactivityDuration: parseFloat(details.inactivityDuration),
        lastActivity: parseFloat(details.lastActivity),
        personalMessage: details.personalMessage ?? '',
        isClaimed: details.isClaimed,
        isExpired: details.isExpired,
        createdAt: parseFloat(details.createdAt),
      };
    } catch (error) {
      console.error('Error getting will details:', error);
      return null;
    }
  }

  /**
   * Format time remaining in human-readable format
   */
  static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'EXPIRED';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${
        minutes > 1 ? 's' : ''
      }`;
    }

    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  /**
   * Get expiry status for a specific will
   */
  static getExpiryStatus(
    lastActivity: number,
    inactivityDuration: number,
  ): {
    isExpired: boolean;
    isExpiringSoon: boolean;
    timeRemaining: number;
    formattedTimeRemaining: string;
  } {
    const currentTime = Date.now() / 1000;
    const timeRemaining = lastActivity + inactivityDuration - currentTime;

    return {
      isExpired: timeRemaining <= 0,
      isExpiringSoon: timeRemaining > 0 && timeRemaining <= 86400, // 24 hours
      timeRemaining: Math.max(0, timeRemaining),
      formattedTimeRemaining: this.formatTimeRemaining(timeRemaining),
    };
  }
}
