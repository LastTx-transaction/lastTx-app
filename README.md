# LastTx - Digital Inheritance System

A complete monorepo for LastTx digital inheritance platform, combining Flow blockchain smart contracts with a modern Next.js frontend.

## 🏗️ Project Structure

```
LastTx-app/
├── smart-contract/        # Flow blockchain contracts & scripts
│   ├── contracts/         # Cadence smart contracts
│   ├── scripts/           # Read-only blockchain scripts
│   ├── transactions/      # Blockchain transactions
│   ├── flow.json         # Flow configuration
│   └── setup.sh          # Deployment setup script
│
├── frontend/             # Next.js web application
│   ├── src/              # Application source code
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- [Flow CLI](https://docs.onflow.org/flow-cli/install/) installed
- [Node.js](https://nodejs.org/) (v18 or higher)

### Setup

```bash
# 1. Clone and navigate to project
cd LastTx-app

# 2. Setup smart contracts
cd smart-contract
chmod +x setup.sh
./setup.sh

# 3. Setup frontend (in new terminal)
cd frontend
npm install
npm run dev
```

This will:
1. Start Flow emulator
2. Deploy LastTx smart contracts
3. Install frontend dependencies  
4. Start development server at http://localhost:3000

### Manual Setup

#### 1. Smart Contract Development

```bash
cd smart-contract

# Install Flow CLI (if not installed)
# Windows: winget install --id=Dapper.FlowCLI -e
# macOS: brew install flow-cli

# Start Flow emulator
flow emulator start

# Deploy contracts (in new terminal)
flow project deploy --network emulator
```

#### 2. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Development Workflow

### Smart Contract Changes
1. Edit contracts in `smart-contract/contracts/`
2. Test with `flow test`
3. Deploy to emulator with `flow project deploy`

### Frontend Changes
1. Edit React components in `frontend/src/`
2. View changes at `http://localhost:3000`
3. Build for production with `npm run build`

## 📦 Technology Stack

- **Blockchain**: Flow blockchain with Cadence smart contracts
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3 Integration**: @onflow/fcl for blockchain interaction
- **UI Components**: shadcn/ui with Radix UI primitives
- **Tools**: ESLint, PostCSS, date-fns

## 🔧 Integration Features

### Smart Contract Integration
- ✅ LastTx smart contract deployed on Flow emulator
- ✅ Cadence scripts for reading blockchain data
- ✅ Cadence transactions for write operations
- ✅ Flow FCL configuration for wallet connection
- ✅ TypeScript service layer for blockchain interactions

### Frontend Features
- ✅ Wallet authentication with Flow FCL
- ✅ Dashboard showing LastTx status and statistics
- ✅ Real-time data from smart contracts
- ✅ Create and manage inheritance contracts
- ✅ Activity pulse and fund management
- ✅ Modern responsive UI with Tailwind CSS

### Ready-to-Use Components
- `AuthButton` - Wallet connection component
- `LastTxCard` - Display LastTx details with actions
- `LastTxService` - Service layer for blockchain operations
- Custom hooks: `useAuth`, `useLastTx`

## 🔗 Useful Commands

```bash
# Smart Contract Development
cd smart-contract
flow emulator start              # Start Flow emulator
flow project deploy --network emulator  # Deploy contracts
./setup.sh                      # Full setup and deployment

# Frontend Development  
cd frontend
npm run dev                     # Development server
npm run build                   # Production build
npm run lint                    # Run linting
npm run start                   # Start production server
```

## 🌐 Accessing the Application

Once everything is running:

1. **Frontend**: http://localhost:3000
2. **Flow Emulator**: http://localhost:8080  
3. **Dev Wallet**: http://localhost:8701/fcl/authn

### First Time Setup:
1. Run the setup commands above
2. Open http://localhost:3000
3. Click "Connect Wallet" 
4. Use Flow Dev Wallet to create/connect account
5. Click "Setup Account" when prompted
6. Start creating your digital inheritance contracts!

## 📚 Documentation

- [Flow Documentation](https://developers.flow.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cadence Language Reference](https://docs.onflow.org/cadence/)

## 🤝 Contributing

1. Make changes in the appropriate directory (`smart-contract/` or `frontend/`)
2. Test your changes locally
3. Submit pull request with clear description

## 📄 License

This project is part of the LastTx digital inheritance system.
