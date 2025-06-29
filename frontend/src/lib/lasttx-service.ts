/* eslint-disable @typescript-eslint/no-explicit-any */
import { fcl } from './flow-config';
import * as scripts from './cadence/scripts';
import * as transactions from './cadence/transactions';

export interface Beneficiary {
  address: string;
  percentage: number;
  name?: string;
}

export interface LastTxDetails {
  id: string;
  owner: string;
  personalMessage?: string;
  lastActivity: number;
  inactivityDuration: number;
  beneficiaries: Beneficiary[];
  balance: number;
  isExpired: boolean;
  isActive: boolean;
  createdAt: number;
  timeRemaining: number;
}

export class LastTxService {
  // Check if account is set up for LastTx
  static async isAccountSetup(address: string): Promise<boolean> {
    try {
      return await fcl.query({
        cadence: scripts.GET_ACCOUNT_SETUP,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });
    } catch (error) {
      console.error('Error checking account setup:', error);
      return false;
    }
  }

  // Setup account for LastTx
  static async setupAccount(): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: transactions.SETUP_ACCOUNT,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error setting up account:', error);
      throw error;
    }
  }

  // Create new LastTx
  static async createLastTx(
    inactivityDuration: number,
    beneficiaries: Beneficiary[],
    personalMessage?: string,
  ): Promise<string> {
    try {
      const beneficiaryAddresses = beneficiaries.map((b) => b.address);
      const beneficiaryPercentages = beneficiaries.map((b) =>
        b.percentage.toFixed(2),
      );
      const beneficiaryNames = beneficiaries.map((b) => b.name ?? null);

      const transactionId = await fcl.mutate({
        cadence: transactions.CREATE_LASTTX,
        args: (arg: any, t: any) => [
          arg(inactivityDuration.toFixed(2), t.UFix64),
          arg(beneficiaryAddresses, t.Array(t.Address)),
          arg(beneficiaryPercentages, t.Array(t.UFix64)),
          arg(beneficiaryNames, t.Array(t.Optional(t.String))),
          arg(personalMessage ?? null, t.Optional(t.String)),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error creating LastTx:', error);
      throw error;
    }
  }

  // Get LastTx IDs for an account
  static async getLastTxIds(address: string): Promise<string[]> {
    try {
      const ids = await fcl.query({
        cadence: scripts.GET_LASTTX_IDS,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });
      return ids.map((id: any) => id.toString());
    } catch (error) {
      console.error('Error getting LastTx IDs:', error);
      return [];
    }
  }

  // Get LastTx details
  static async getLastTxDetails(
    address: string,
    id: string,
  ): Promise<LastTxDetails | null> {
    try {
      const details = await fcl.query({
        cadence: scripts.GET_LASTTX_DETAILS,
        args: (arg: any, t: any) => [
          arg(address, t.Address),
          arg(id, t.UInt64),
        ],
      });

      if (!details) return null;

      return {
        id: details.id.toString(),
        owner: details.owner,
        personalMessage: details.personalMessage,
        lastActivity: parseFloat(details.lastActivity),
        inactivityDuration: parseFloat(details.inactivityDuration),
        beneficiaries: details.beneficiaries.map((b: any) => ({
          address: b.address,
          percentage: parseFloat(b.percentage),
          name: b.name,
        })),
        balance: parseFloat(details.balance),
        isExpired: details.isExpired,
        isActive: details.isActive,
        createdAt: parseFloat(details.createdAt),
        timeRemaining: parseFloat(details.timeRemaining),
      };
    } catch (error) {
      console.error('Error getting LastTx details:', error);
      return null;
    }
  }

  // Get all LastTx for an account
  static async getAllLastTx(
    address: string,
  ): Promise<Record<string, LastTxDetails>> {
    try {
      const allData = await fcl.query({
        cadence: scripts.GET_ALL_LASTTX,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });

      const result: Record<string, LastTxDetails> = {};

      for (const [id, details] of Object.entries(
        allData as Record<string, any>,
      )) {
        result[id] = {
          id: details.id.toString(),
          owner: details.owner,
          personalMessage: details.personalMessage,
          lastActivity: parseFloat(details.lastActivity),
          inactivityDuration: parseFloat(details.inactivityDuration),
          beneficiaries: details.beneficiaries.map((b: any) => ({
            address: b.address,
            percentage: parseFloat(b.percentage),
            name: b.name,
          })),
          balance: parseFloat(details.balance),
          isExpired: details.isExpired,
          isActive: details.isActive,
          createdAt: parseFloat(details.createdAt),
          timeRemaining: parseFloat(details.timeRemaining),
        };
      }

      return result;
    } catch (error) {
      console.error('Error getting all LastTx:', error);
      return {};
    }
  }

  // Send activity pulse
  static async sendActivityPulse(id: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: transactions.SEND_ACTIVITY_PULSE,
        args: (arg: any, t: any) => [arg(id, t.UInt64)],
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

  // Deposit funds
  static async depositFunds(id: string, amount: number): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: transactions.DEPOSIT_FUNDS,
        args: (arg: any, t: any) => [
          arg(id, t.UInt64),
          arg(amount.toFixed(8), t.UFix64),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error depositing funds:', error);
      throw error;
    }
  }

  // Distribute funds
  static async distributeFunds(id: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: transactions.DISTRIBUTE_FUNDS,
        args: (arg: any, t: any) => [arg(id, t.UInt64)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error distributing funds:', error);
      throw error;
    }
  }

  // Get account balance
  static async getAccountBalance(address: string): Promise<number> {
    try {
      const balance = await fcl.query({
        cadence: scripts.GET_ACCOUNT_BALANCE,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });
      return parseFloat(balance);
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  // Get expired LastTx
  static async getExpiredLastTx(address: string): Promise<string[]> {
    try {
      const ids = await fcl.query({
        cadence: scripts.GET_EXPIRED_LASTTX,
        args: (arg: any, t: any) => [arg(address, t.Address)],
      });
      return ids.map((id: any) => id.toString());
    } catch (error) {
      console.error('Error getting expired LastTx:', error);
      return [];
    }
  }

  // Get global stats
  static async getGlobalStats(): Promise<{ totalCreated: number }> {
    try {
      const stats = await fcl.query({
        cadence: scripts.GET_LASTTX_STATS,
        args: () => [],
      });
      return {
        totalCreated: parseInt(stats.totalCreated),
      };
    } catch (error) {
      console.error('Error getting global stats:', error);
      return { totalCreated: 0 };
    }
  }

  // Update existing LastTx
  static async updateLastTx(
    id: string,
    inactivityDuration: number,
    beneficiaries: Beneficiary[],
    personalMessage?: string,
  ): Promise<string> {
    try {
      const beneficiaryAddresses = beneficiaries.map((b) => b.address);
      const beneficiaryPercentages = beneficiaries.map((b) =>
        b.percentage.toFixed(2),
      );
      const beneficiaryNames = beneficiaries.map((b) => b.name ?? null);

      const transactionId = await fcl.mutate({
        cadence: transactions.UPDATE_LASTTX,
        args: (arg: any, t: any) => [
          arg(parseInt(id), t.UInt64),
          arg(inactivityDuration.toFixed(2), t.UFix64),
          arg(beneficiaryAddresses, t.Array(t.Address)),
          arg(beneficiaryPercentages, t.Array(t.UFix64)),
          arg(beneficiaryNames, t.Array(t.Optional(t.String))),
          arg(personalMessage ?? null, t.Optional(t.String)),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error updating LastTx:', error);
      throw error;
    }
  }

  // Delete existing LastTx
  static async deleteLastTx(id: string): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: transactions.DELETE_LASTTX,
        args: (arg: any, t: any) => [arg(parseInt(id), t.UInt64)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error deleting LastTx:', error);
      throw error;
    }
  }
}
