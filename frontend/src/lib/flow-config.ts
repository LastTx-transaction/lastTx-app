import * as fcl from "@onflow/fcl";

// Simple network configuration - hardcode what's public, env only for what needs to be dynamic
const FLOW_NETWORK = process.env.NEXT_PUBLIC_FLOW_NETWORK ?? "emulator"; // Default to testnet
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "2b1c2b1c2b1c2b1c2b1c2b1c2b1c2b1c";

// Network configurations (hardcoded - these are public information)
const NETWORKS = {
  emulator: {
    accessNode: "http://localhost:8888",
    discoveryWallet: "http://localhost:8701/fcl/authn",
    contracts: {
      LastTx: "0xf8d6e0586b0a20c7",
      FungibleToken: "0xee82856bf20e2aa6",
      FlowToken: "0x0ae53cb6e3f42a79",
    },
  },
  testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
    contracts: {
      LastTx: "0xbc9f801a100be393", // Our deployed contract
      FungibleToken: "0x9a0766d93b6608b7",
      FlowToken: "0x7e60df042a9c0868",
    },
  },
  mainnet: {
    accessNode: "https://rest-mainnet.onflow.org",
    discoveryWallet: "https://fcl-discovery.onflow.org/authn",
    contracts: {
      LastTx: "", // Deploy later
      FungibleToken: "0xf233dcee88fe0abe",
      FlowToken: "0x1654653399040a61",
    },
  },
};

// Current network config
const currentNetwork =
  NETWORKS[FLOW_NETWORK as keyof typeof NETWORKS] || NETWORKS.testnet;

// Flow configuration
fcl.config({
  "app.detail.title": "LastTx - Digital Inheritance",
  "app.detail.icon": "https://i.ibb.co/pvgsPMPS/lasttx.png",
  "accessNode.api": currentNetwork.accessNode,
  "discovery.wallet": currentNetwork.discoveryWallet,
  "walletconnect.projectId": WALLETCONNECT_PROJECT_ID,
  // Set contract addresses for FCL
  "0xLastTx": currentNetwork.contracts.LastTx,
  "0xFungibleToken": currentNetwork.contracts.FungibleToken,
  "0xFlowToken": currentNetwork.contracts.FlowToken,
});

// Exports
export { fcl };
export const getCurrentUser = () => fcl.currentUser.snapshot();
export const logIn = () => fcl.authenticate();
export const logOut = () => fcl.unauthenticate();

// Export current configuration for easy access
export const flowConfig = {
  network: FLOW_NETWORK,
  ...currentNetwork,
};

// Utility function to get contract addresses for current network
export const getContractAddress = (
  contractName: keyof typeof currentNetwork.contracts
) => {
  return currentNetwork.contracts[contractName];
};
