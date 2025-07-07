# LastTx - Blockchain Inheritance System

A decentralized inheritance platform that automatically transfers crypto assets to designated beneficiaries after a specified period of wallet inactivity.

## Flow Integration

This project integrates with the **Flow blockchain** to create smart contracts that:

- Monitor wallet activity for specified inactivity periods
- Track percentage of assets designated for inheritance (not locked or escrowed)
- Automatically enable inheritance claims when deadlines pass
- Notify beneficiaries through email when they can claim assets
- **Important**: Your assets remain fully under your control - no funds are locked or escrowed

The integration was achieved using Flow's Cadence smart contract language and Flow Client Library for seamless blockchain interactions from our Next.js frontend.

## Team

- **Azzam** - Full Stack Developer
  - GitHub: [@azzam](https://github.com/m-azzam-azis)
  - LinkedIn: [@azzam](https://www.linkedin.com/in/m-azzam-azis/)
- **Daffa Rafi** - Full Stack Developer
  - GitHub: [@daffarafi](https://github.com/daffarafi)
  - GitHub: [@daffarafi](https://www.linkedin.com/in/daffa-rafi/)

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Blockchain

- **Flow Blockchain** - Layer-1 blockchain for smart contracts
- **Cadence** - Flow's smart contract programming language
- **Flow Client Library** - JavaScript SDK for Flow integration

### Backend & Infrastructure

- **Supabase** - PostgreSQL database and Edge Functions
- **Google Cloud Scheduler** - Automated task scheduling
- **SendGrid** - Email delivery service
- **Vercel** - Deployment platform

## Features

- 🔐 **Secure Smart Contracts**: Inheritance logic secured on Flow blockchain
- 💰 **Non-Custodial**: Your funds remain completely under your control - no escrow or locking
- ⏰ **Automated Execution**: Google Cloud Scheduler triggers inheritance transfers
- 📧 **Email Notifications**: Beneficiaries receive beautiful inheritance notifications
- 🎯 **Activity Monitoring**: Tracks wallet activity to determine inactivity periods
- 📊 **Dashboard**: View and manage all created inheritance wills
- 🛡️ **Security First**: You maintain full control of your private keys and assets

## Important:

You might need to allow cookies on some browsers. This might be the cause for `Application error: a client-side exception...`

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Flow CLI (for smart contract deployment)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/LastTx-transaction/lastTx-app
   cd lastTx-app
   ```

2. **Smart contract setup**

   ```bash
   cd smart-contract

   # Setup local flow emulator
   flow emulator start

   # Setup wallet (in different terminal)
   flow dev-wallet

   # Deploy smart contracts locally (different terminal)
   flow project deploy
   ```

3. **Frontend setup** (different terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

5. **Optional Email Features**
   Add these to enable email notifications after inheritance execution:

   ```env
   # Supabase (Optional - for email notifications)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key

   # Google Cloud Scheduler (Optional - for automated execution)
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account-email
   GOOGLE_CLOUD_PRIVATE_KEY=your-service-account-private-key
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## No-Notification Setup (Quickest Way)

If you want to test just the core blockchain functionality without email features:

1. Follow steps 1-4 above (skip step 5)
2. The app will work perfectly for creating inheritance smart contracts
3. You'll see a success message noting that email features are disabled

**Note**: Without email configuration, beneficiaries won't receive automatic notifications. They'll need to check and claim their inheritance manually.

## Full Setup with Email Notifications

### Supabase Setup

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL schema:
   ```sql
   -- Copy content from supabase-schema.sql and run in Supabase SQL Editor
   ```
3. Get your project URL and anon key from Settings > API
4. create an edge function called `send-email`. Copy the content from `/frontend/supabase/edge-function/index.ts` and uncomment the code

### Google Cloud Setup

1. Create a Google Cloud project
2. Enable Cloud Scheduler API
3. Create a service account with `Cloud Scheduler Admin` role
4. Download the service account JSON key
5. Add the credentials to your `.env.local`

### SendGrid Setup (for Supabase Edge Function)

1. Create a [SendGrid](https://sendgrid.com) account
2. Get your API key
3. Add it to your Supabase project secrets

## Usage

### Creating an Inheritance Will

1. **Connect Wallet**: Connect your Flow wallet
2. **Set Beneficiary**: Add recipient's name, email, and wallet address
3. **Configure Terms**: Set inheritance percentage and inactivity period
4. **Add Message**: Optional personal message for the beneficiary
5. **Deploy**: Create and deploy the smart contract
6. **Schedule**: (Optional) Set up automated email notifications

### Managing Wills

- View all your created wills in the "My Wills" dashboard
- Monitor status: Active, Expired, or Claimed
- Track execution dates and beneficiary information
- Delete and recreate wills as needed (editing requires deletion and recreation)
- Send activity pulses to reset inactivity timers

### For Beneficiaries

When an inheritance becomes claimable:

1. Beneficiaries receive an email notification (if configured)
2. They can claim their inheritance using the provided link
3. Assets are transferred from the owner's wallet at the time of claiming
4. **Important**: The owner retains full control of their assets until the moment of claiming

## Future Plans

- [ ] Mobile app development
- [ ] Cross-chain compatibility (Ethereum, Polygon)
- [ ] NFT inheritance support
- [ ] Advanced analytics dashboard

## Contributing

We welcome contributions!

## Support

- Email: m.azzam.azis@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Disclaimer**: This is experimental software. Use at your own risk. Always test thoroughly on testnets before using with real assets.
