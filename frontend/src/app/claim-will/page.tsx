'use client';

import { useState, useEffect } from 'react';
import { useLastTx } from '@/lib/hooks/useLastTx';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthRequired } from '@/components/auth/AuthButton';
import { LastTxService } from '@/lib/lasttx-service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  AlertCircle,
  CheckCircle,
  Bell,
  Gift,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

export default function ClaimWillPage() {
  const { user, isAuthenticated } = useAuth();
  const { expiredLastTxs, refresh } = useLastTx();
  const [isMounted, setIsMounted] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Convert expired LastTx contracts to notification format
  const notifications = expiredLastTxs
    .map((lastTx, index) => {
      const id = `notification_${index}`;
      const beneficiary = lastTx.beneficiaries.find(
        (b) => b.address === user?.addr,
      );

      if (!beneficiary) return null;

      return {
        id,
        type: 'inheritance_available' as const,
        fromName: `Creator ${lastTx.id?.slice(0, 8) ?? 'Unknown'}`,
        fromAddress: lastTx.id ?? 'Unknown',
        percentage: beneficiary.percentage,
        estimatedValue: (lastTx.balance ?? 0).toFixed(2),
        token: 'FLOW' as const,
        triggeredDate: new Date(lastTx.lastActivity * 1000)
          .toISOString()
          .split('T')[0],
        message: `Inheritance from contract ${
          lastTx.id?.slice(0, 8) ?? 'Unknown'
        }`,
        contractAddress: `Contract #${index}`,
        status: 'claimable' as const,
        rawData: lastTx,
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const handleClaim = async (notificationId: string) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }

    setClaiming(notificationId);

    try {
      // Find the notification and get the contract data
      const notification = notifications.find((n) => n?.id === notificationId);
      if (!notification) {
        alert('Notification not found');
        return;
      }

      // For now, we'll use distributeFunds which should distribute to the beneficiaries
      // In a full implementation, we'd need a specific "claim" function
      const contractId = notification.id.replace('notification_', '');
      const success = await LastTxService.distributeFunds(contractId);

      if (success) {
        alert('Inheritance claimed successfully!');
        refresh(); // Refresh data
      } else {
        alert('Failed to claim inheritance. Please try again.');
      }
    } catch (error) {
      console.error('Error claiming inheritance:', error);
      alert('An error occurred while claiming inheritance.');
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'claimable':
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Gift className="h-3 w-3 mr-1" />
            Ready to Claim
          </Badge>
        );
      case 'claimed':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Claimed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const availableInheritances = notifications.filter(
    (n) => n.status === 'claimable',
  );
  // For now, we don't track claimed inheritances separately
  const claimedInheritances: typeof notifications = [];

  if (!isMounted) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Inheritance Notifications
              </h1>
              <p className="text-xl text-muted-foreground">
                Claim your inherited digital assets and view your inheritance
                history
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-primary/10">
                <CardContent className="py-1">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {availableInheritances.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available to Claim
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/10">
                <CardContent className="py-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {claimedInheritances.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Already Claimed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/10">
                <CardContent className="py-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        $
                        {availableInheritances
                          .reduce(
                            (sum, n) =>
                              sum +
                              parseFloat(
                                (n.estimatedValue || '0').replace(/,/g, ''),
                              ),
                            0,
                          )
                          .toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Available
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Inheritances */}
            {availableInheritances.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Gift className="h-6 w-6 mr-2 text-primary" />
                  Available Inheritances
                </h2>
                <div className="space-y-6">
                  {availableInheritances.map((notification) => (
                    <Card
                      key={notification.id}
                      className="border-green-200 bg-green-50/30 hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>
                              Inheritance from {notification.fromName}
                            </span>
                          </CardTitle>
                          {getStatusBadge(notification.status)}
                        </div>
                        <CardDescription>
                          Contract triggered on{' '}
                          {formatDate(notification.triggeredDate || '')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">From</p>
                              <p className="text-sm text-muted-foreground">
                                {notification.fromName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {notification.fromAddress}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Asset Allocation
                              </p>
                              <div className="flex items-center space-x-2">
                                <p className="text-lg font-bold text-primary">
                                  {notification.percentage}%
                                </p>
                                <Badge variant="outline">
                                  {notification.token}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Estimated Value
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                ${notification.estimatedValue}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {notification.message && (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Personal Message
                                </p>
                                <div className="bg-card border border-border rounded-lg p-4">
                                  <p className="text-sm text-muted-foreground italic">
                                    &ldquo;{notification.message}&rdquo;
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => handleClaim(notification.id)}
                                className="w-full"
                                size="lg"
                                disabled={claiming === notification.id}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                {claiming === notification.id
                                  ? 'Claiming...'
                                  : 'Claim Inheritance'}
                              </Button>
                              {/* <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Contract
                              </Button> */}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {notifications.length === 0 && (
              <Card className="border-primary/10">
                <CardContent className="pt-6 text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Inheritance Notifications
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You don&apos;t have any inheritance notifications at the
                    moment. This page will show available inheritances when
                    inactivity timers trigger.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Important Notice */}
            <Card className="mt-12 border-amber-200 bg-amber-50/50">
              <CardContent className="py-1">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="size-6 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">
                      How Inheritance Notifications Work
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      This page automatically displays available inheritances
                      when smart contracts trigger due to inactivity.
                      You&apos;ll be notified when funds become available to
                      claim. Each inheritance is a separate contract with its
                      own terms and conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthRequired>
  );
}
