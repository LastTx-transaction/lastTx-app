import * as fcl from '@onflow/fcl';
import { SETUP_USER_PROFILE } from '../cadence/transactions';
import { GET_USER_PROFILE } from '../cadence/scripts';

export interface UserProfile {
  owner: string;
  email?: string;
  name?: string;
  createdAt: number;
  updatedAt: number;
}

export class UserProfileService {
  /**
   * Set up or update user profile with email and name
   */
  static async setupUserProfile(
    email: string = '',
    name: string = '',
  ): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: SETUP_USER_PROFILE,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [
          arg(email || null, t.Optional(t.String)),
          arg(name || null, t.Optional(t.String)),
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      await fcl.tx(transactionId).onceSealed();
      return transactionId;
    } catch (error) {
      console.error('Error setting up user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  static async getUserProfile(
    userAddress: string,
  ): Promise<UserProfile | null> {
    try {
      const result = await fcl.query({
        cadence: GET_USER_PROFILE,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: (arg: any, t: any) => [arg(userAddress, t.Address)],
      });

      if (!result) return null;

      return {
        owner: result.owner,
        email: result.email || undefined,
        name: result.name || undefined,
        createdAt: parseFloat(result.createdAt),
        updatedAt: parseFloat(result.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if user has email configured
   */
  static async hasEmail(userAddress: string): Promise<boolean> {
    const profile = await this.getUserProfile(userAddress);
    return !!profile?.email;
  }

  /**
   * Get user email
   */
  static async getUserEmail(userAddress: string): Promise<string | null> {
    const profile = await this.getUserProfile(userAddress);
    return profile?.email || null;
  }
}
