'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Wallet, Settings, Coins, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentFlowUser } from '@onflow/kit';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, authenticate, unauthenticate } = useCurrentFlowUser();
  const { user: authUser, balanceLoading, toggleBalanceVisibility } = useAuth();

  const getBalanceDisplay = () => {
    if (!authUser.balanceVisible) return '****';
    return balanceLoading ? '...' : `${authUser.balance}`;
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">
                      ⚡
                    </span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-foreground">
                    Last Tx
                  </span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              {user?.loggedIn && (
                <>
                  <Link
                    href="/create-will"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Create Wills
                  </Link>
                  <Link
                    href="/my-wills"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    My Wills
                  </Link>
                  {/* <Link
                    href="/claim-will"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Notifications
                  </Link> */}
                  {/* <Link
                    href="/settings"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Settings
                  </Link> */}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user?.loggedIn ? (
              <div className="flex items-center gap-3">
                {/* Flow Balance */}
                <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-lg">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {getBalanceDisplay()} FLOW
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleBalanceVisibility}
                    className="p-1 h-6 w-6 ml-1"
                  >
                    {authUser.balanceVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* User Address */}
                <span className="text-sm text-muted-foreground">
                  {user.addr?.slice(0, 8)}...
                </span>

                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = '/settings')}
                  className="p-2"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                {/* Disconnect Button */}
                <Button variant="outline" size="sm" onClick={unauthenticate}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={authenticate} size="sm">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden border-t border-border">
          <div className="pt-2 pb-3 space-y-1 bg-card">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent hover:border-primary hover:text-foreground"
            >
              Home
            </Link>
            {user?.loggedIn && (
              <>
                <Link
                  href="/create-will"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent hover:border-primary hover:text-foreground"
                >
                  Create Rules
                </Link>
                <Link
                  href="/my-wills"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent hover:border-primary hover:text-foreground"
                >
                  My Rules
                </Link>
                <Link
                  href="/claim-will"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent hover:border-primary hover:text-foreground"
                >
                  Notifications
                </Link>
                <Link
                  href="/settings"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-muted-foreground hover:bg-accent hover:border-primary hover:text-foreground"
                >
                  Settings
                </Link>
              </>
            )}
            <div className="pl-3 pr-4 py-2">
              {user?.loggedIn ? (
                <div className="space-y-2">
                  {/* Flow Balance - Mobile */}
                  <div className="flex items-center gap-1 px-3 py-2 bg-primary/10 rounded-lg">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {getBalanceDisplay()} FLOW
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleBalanceVisibility}
                      className="p-1 h-6 w-6 ml-1"
                    >
                      {authUser.balanceVisible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground px-3">
                    {user.addr?.slice(0, 8)}...
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={unauthenticate}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={authenticate} size="sm" className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
