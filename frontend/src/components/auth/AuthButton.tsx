'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { Wallet, LogOut } from 'lucide-react';

export function AuthButton() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Button disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {user.addr?.slice(0, 8)}...{user.addr?.slice(-6)}
        </span>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={signIn}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

export function AuthRequired({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-[70vh] flex  items-center">
        <Card className="max-w-md mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please connect your wallet to access LastTx features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={signIn} className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
