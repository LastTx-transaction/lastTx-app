import { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

export const useFlowBalance = (userAddress: string | null) => {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) {
      setBalance('0.00');
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const response = await fcl.query({
          cadence: `
            import FlowToken from 0x0ae53cb6e3f42a79
            import FungibleToken from 0xee82856bf20e2aa6

            pub fun main(address: Address): UFix64 {
              let account = getAccount(address)
              let vaultRef = account.getCapability(/public/flowTokenBalance)
                .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
                ?? panic("Could not borrow Balance reference to the Vault")
              
              return vaultRef.balance
            }
          `,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: (arg: any, t: any) => [arg(userAddress, t.Address)],
        });

        setBalance(parseFloat(response).toFixed(2));
      } catch (error) {
        console.error('Error fetching FLOW balance:', error);
        setBalance('0.00');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Update balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [userAddress]);

  return { balance, loading };
};
