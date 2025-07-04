'use client';

import { FlowProvider } from '@onflow/kit';
import flowJson from '../../flow.json';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmailProvider from '@/components/providers/EmailProvider';
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
            accessNodeUrl: 'http://localhost:8888',
            flowNetwork: 'emulator',
            discoveryWallet: 'https://fcl-discovery.onflow.org/emulator/authn',
          }}
          flowJson={flowJson}
        >
          <EmailProvider>
            <Navbar />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
          </EmailProvider>
        </FlowProvider>
      </body>
    </html>
  );
}
