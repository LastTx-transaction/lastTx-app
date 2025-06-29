import * as fcl from '@onflow/fcl';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  '2b1c2b1c2b1c2b1c2b1c2b1c2b1c2b1c';

// Flow configuration for development
fcl.config({
  'app.detail.title': 'LastTx - Digital Inheritance',
  'app.detail.icon': 'https://placekitten.com/g/200/200',
  'accessNode.api': isDevelopment
    ? 'http://localhost:8888'
    : 'https://rest-testnet.onflow.org', // Flow emulator for dev, testnet for prod
  'discovery.wallet': isDevelopment
    ? 'http://localhost:8701/fcl/authn'
    : 'https://fcl-discovery.onflow.org/authn', // Flow dev wallet for local, discovery for prod
  'walletconnect.projectId': WALLETCONNECT_PROJECT_ID, // WalletConnect project ID
  '0xProfile': isDevelopment ? '0xf8d6e0586b0a20c7' : '', // Profile contract address
  '0xLastTx': isDevelopment ? '0xf8d6e0586b0a20c7' : '', // LastTx contract address
  '0xFungibleToken': isDevelopment
    ? '0xee82856bf20e2aa6'
    : '0x9a0766d93b6608b7', // FungibleToken for emulator/testnet
  '0xFlowToken': isDevelopment ? '0x0ae53cb6e3f42a79' : '0x7e60df042a9c0868', // FlowToken for emulator/testnet
});

// Authentication status
export { fcl };

// Helper functions
export const getCurrentUser = () => fcl.currentUser.snapshot();
export const logIn = () => fcl.authenticate();
export const logOut = () => fcl.unauthenticate();

// Contract addresses for different networks
export const CONTRACTS = {
  emulator: {
    LastTx: '0xf8d6e0586b0a20c7',
    FungibleToken: '0xee82856bf20e2aa6',
    FlowToken: '0x0ae53cb6e3f42a79',
  },
  testnet: {
    LastTx: '', // Deploy to testnet later
    FungibleToken: '0x9a0766d93b6608b7',
    FlowToken: '0x7e60df042a9c0868',
  },
  mainnet: {
    LastTx: '', // Deploy to mainnet later
    FungibleToken: '0xf233dcee88fe0abe',
    FlowToken: '0x1654653399040a61',
  },
};

// Current network (change based on environment)
export const NETWORK = 'emulator';
export const CONTRACT_ADDRESSES = CONTRACTS[NETWORK];
