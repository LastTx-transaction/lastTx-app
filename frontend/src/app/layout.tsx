'use client';

import { FlowProvider } from '@onflow/kit';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen  bg-background font-sans antialiased">
        <FlowProvider
          config={{
            accessNodeUrl: 'https://rest-testnet.onflow.org',
            flowNetwork: 'testnet',
            discoveryWallet: 'https://fcl-discovery.onflow.org/testnet/authn',
          }}
        >
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </FlowProvider>
      </body>
    </html>
  );
}
