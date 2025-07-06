'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthRequired } from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Gift,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Percent,
} from 'lucide-react';
import { fcl } from '@/lib/flow-config';
import * as TRANSACTIONS from '@/lib/cadence/transactions';
import * as SCRIPTS from '@/lib/cadence/scripts';

interface WillDetails {
  id: string;
  owner: string;
  beneficiaries: Array<{
    address: string;
    percentage: number;
    name?: string;
    email?: string;
  }>;
  inactivityDuration: number;
  lastActivity: number;
  personalMessage?: string;
  isClaimed: boolean;
  isExpired: boolean;
  createdAt: number;
}

interface BeneficiaryData {
  address: string;
  percentage: string;
  name?: string;
  email?: string;
}

export default function ClaimPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const [willDetails, setWillDetails] = useState<WillDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Get parameters from URL
  const ownerAddress = searchParams.get('owner');
  const willId = searchParams.get('id');

  // Fetch will details
  useEffect(() => {
    const fetchWillDetails = async () => {
      if (!ownerAddress || !willId) {
        setMessage({
          type: 'error',
          text: 'Missing required parameters. Invalid claim link.',
        });
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching will details:', { ownerAddress, willId });

        const details = await fcl.query({
          cadence: SCRIPTS.GET_LASTTX_DETAILS,
          args: (arg, t) => [
            arg(ownerAddress, t.Address),
            arg(willId, t.UInt64),
          ],
        });

        if (!details) {
          setMessage({
            type: 'error',
            text: 'Will not found or does not exist.',
          });
          return;
        }

        // Convert the details to our interface
        const processedDetails: WillDetails = {
          id: details.id.toString(),
          owner: details.owner,
          beneficiaries: details.beneficiaries.map((b: BeneficiaryData) => ({
            address: b.address,
            percentage: parseFloat(b.percentage),
            name: b.name,
            email: b.email,
          })),
          inactivityDuration: parseFloat(details.inactivityDuration),
          lastActivity: parseFloat(details.lastActivity),
          personalMessage: details.personalMessage,
          isClaimed: details.isClaimed,
          isExpired: details.isExpired,
          createdAt: parseFloat(details.createdAt),
        };

        console.log('Will details loaded:', processedDetails);
        setWillDetails(processedDetails);

        // Check if user is beneficiary
        if (user?.addr) {
          const isUserBeneficiary = processedDetails.beneficiaries.some(
            (b) => b.address === user.addr,
          );

          if (!isUserBeneficiary) {
            setMessage({
              type: 'error',
              text: 'You are not a beneficiary of this will.',
            });
          } else if (!processedDetails.isExpired) {
            setMessage({
              type: 'info',
              text: 'This will has not expired yet. You cannot claim it at this time.',
            });
          } else if (processedDetails.isClaimed) {
            setMessage({
              type: 'info',
              text: 'This will has already been claimed.',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching will details:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load will details. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWillDetails();
  }, [ownerAddress, willId, user?.addr]);

  const handleClaim = async () => {
    if (!isAuthenticated || !ownerAddress || !willId || !willDetails) {
      return;
    }

    setIsClaiming(true);
    setMessage(null);

    try {
      console.log('Claiming inheritance:', { ownerAddress, willId });

      const transactionId = await fcl.mutate({
        cadence: TRANSACTIONS.CLAIM_WILL,
        args: (arg, t) => [arg(ownerAddress, t.Address), arg(willId, t.UInt64)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000,
      });

      console.log('Transaction submitted:', transactionId);
      setMessage({
        type: 'info',
        text: 'Transaction submitted. Waiting for confirmation...',
      });

      // Wait for transaction to be sealed
      const result = await fcl.tx(transactionId).onceSealed();
      console.log('Transaction sealed:', result);

      if (result.status === 4) {
        // Sealed successfully
        setMessage({
          type: 'success',
          text: 'Inheritance claimed successfully! The assets have been transferred to your wallet.',
        });

        // Update will details to show as claimed
        setWillDetails((prev) => (prev ? { ...prev, isClaimed: true } : null));
      } else {
        setMessage({
          type: 'error',
          text: 'Transaction failed. Please check the console for details.',
        });
      }
    } catch (error) {
      console.error('Error claiming inheritance:', error);
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'An error occurred while claiming inheritance',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserBeneficiary = () => {
    if (!willDetails || !user?.addr) return null;
    return willDetails.beneficiaries.find((b) => b.address === user.addr);
  };

  const canClaim =
    willDetails &&
    user?.addr &&
    willDetails.isExpired &&
    !willDetails.isClaimed &&
    willDetails.beneficiaries.some((b) => b.address === user.addr);

  if (isLoading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading will details...</p>
            </CardContent>
          </Card>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Inheritance Claim
              </h1>
              <p className="text-xl text-muted-foreground">
                You have been invited to claim an inheritance
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <Alert
                className={`mb-6 ${
                  message.type === 'success'
                    ? 'border-green-200 bg-green-50'
                    : message.type === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                {message.type === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {message.type === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {message.type === 'info' && (
                  <Clock className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription
                  className={
                    message.type === 'success'
                      ? 'text-green-800'
                      : message.type === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Will Details */}
            {willDetails && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Will #{willDetails.id}
                    </CardTitle>
                    <Badge
                      variant={
                        willDetails.isExpired ? 'destructive' : 'secondary'
                      }
                    >
                      {willDetails.isExpired ? 'Expired' : 'Active'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created on {formatDate(willDetails.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Owner Info */}
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      Will Creator
                    </h4>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {willDetails.owner}
                    </p>
                  </div>

                  {/* Your Allocation */}
                  {getUserBeneficiary() && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Percent className="h-4 w-4" />
                        Your Allocation
                      </h4>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {getUserBeneficiary()?.percentage}%
                        </p>
                        {getUserBeneficiary()?.name && (
                          <p className="text-sm text-muted-foreground">
                            For: {getUserBeneficiary()?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personal Message */}
                  {willDetails.personalMessage && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Personal Message
                      </h4>
                      <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm italic">
                          &ldquo;{willDetails.personalMessage}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last Activity */}
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      Last Activity
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(willDetails.lastActivity)}
                    </p>
                  </div>

                  {/* Claim Button */}
                  {canClaim && (
                    <div className="pt-4">
                      <Button
                        onClick={handleClaim}
                        className="w-full"
                        size="lg"
                        disabled={isClaiming}
                      >
                        {isClaiming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Gift className="mr-2 h-4 w-4" />
                            Claim My Inheritance
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">
                      How This Works
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>
                        • You received this link because a will has expired and
                        you are a beneficiary
                      </li>
                      <li>
                        • Click the &quot;Claim My Inheritance&quot; button to
                        receive your allocated percentage
                      </li>
                      <li>
                        • The assets will be transferred directly to your
                        connected wallet
                      </li>
                      <li>• This inheritance can only be claimed once</li>
                    </ul>
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
