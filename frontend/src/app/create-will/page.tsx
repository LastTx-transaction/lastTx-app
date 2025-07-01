'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLastTx } from '@/lib/hooks/useLastTx';
import { AuthRequired } from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
import { NotificationDialog } from '@/components/ui/confirm-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Clock } from 'lucide-react';

interface InheritanceRule {
  beneficiaryAddress: string;
  beneficiaryName: string;
  percentage: number;
  inactivityPeriod: number; // in days
  token: string;
  message: string;
}

export default function CreateWillPage() {
  const router = useRouter();
  const { createWill, loading, accountSetup, setupAccount } = useLastTx();

  const [rule, setRule] = useState<InheritanceRule>({
    beneficiaryAddress: '',
    beneficiaryName: '',
    percentage: 0,
    inactivityPeriod: 365,
    token: 'FLOW',
    message: '',
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    description: '',
  });

  const updateRule = (field: keyof InheritanceRule, value: string | number) => {
    setRule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rule.percentage === 0) {
      setNotification({
        open: true,
        type: 'error',
        title: 'Validation Error',
        description: 'Please set a percentage for the inheritance rule.',
      });
      return;
    }

    if (!rule.beneficiaryAddress || !rule.beneficiaryName) {
      setNotification({
        open: true,
        type: 'error',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      // Convert days to seconds for smart contract
      const inactivityDurationSeconds = rule.inactivityPeriod * 24 * 60 * 60;

      // Create will on blockchain with new format
      const success = await createWill(
        rule.beneficiaryAddress, // single beneficiary address
        rule.percentage, // single percentage
        inactivityDurationSeconds,
        rule.beneficiaryName, // single beneficiary name
        rule.message, // personal message
      );

      if (success) {
        setNotification({
          open: true,
          type: 'success',
          title: 'Success!',
          description: 'Inheritance contract created successfully!',
        });
        // Delay navigation to show the success message
        setTimeout(() => {
          router.push('/my-wills');
        }, 2000);
      } else {
        setNotification({
          open: true,
          type: 'error',
          title: 'Creation Failed',
          description:
            'Failed to create inheritance contract. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error creating LastTx:', error);
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        description:
          'An error occurred while creating the inheritance contract.',
      });
    }
  };

  // Show setup required state
  if (!accountSetup) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/10">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
                  <p className="text-muted-foreground mb-6">
                    You need to setup your account before creating inheritance
                    rules
                  </p>
                  <Button onClick={setupAccount} disabled={loading}>
                    {loading ? 'Setting up...' : 'Setup Account'}
                  </Button>
                </CardContent>
              </Card>
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
                Create Inheritance Rule
              </h1>
              <p className="text-xl text-muted-foreground">
                Add a new inactivity-based inheritance contract to protect your
                digital assets
              </p>
            </div>

            {/* Main Form */}
            <Card className="shadow-lg border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Create Inheritance Contract</span>
                </CardTitle>
                <CardDescription>
                  Create a single inheritance contract with inactivity-based
                  asset transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Beneficiary Name */}
                    <div className="space-y-2">
                      <Label htmlFor="beneficiary-name">Beneficiary Name</Label>
                      <Input
                        id="beneficiary-name"
                        placeholder="e.g., John Doe"
                        value={rule.beneficiaryName}
                        onChange={(e) =>
                          updateRule('beneficiaryName', e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Beneficiary Address */}
                    <div className="space-y-2">
                      <Label htmlFor="beneficiary-address">
                        Flow Wallet Address
                      </Label>
                      <Input
                        id="beneficiary-address"
                        placeholder="0x... (Flow wallet address)"
                        value={rule.beneficiaryAddress}
                        onChange={(e) =>
                          updateRule('beneficiaryAddress', e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Percentage */}
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Asset Percentage</Label>
                      <Input
                        id="percentage"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="100"
                        value={rule.percentage || ''}
                        onChange={(e) =>
                          updateRule(
                            'percentage',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of assets to transfer to this beneficiary
                      </p>
                    </div>

                    {/* Inactivity Period */}
                    <div className="space-y-2">
                      <Label htmlFor="inactivity-period">
                        Inactivity Period
                      </Label>
                      <Select
                        value={rule.inactivityPeriod.toString()}
                        onValueChange={(value) =>
                          updateRule('inactivityPeriod', parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">7 days (1 week)</SelectItem>
                          <SelectItem value="30">30 days (1 month)</SelectItem>
                          <SelectItem value="90">90 days (3 months)</SelectItem>
                          <SelectItem value="180">
                            180 days (6 months)
                          </SelectItem>
                          <SelectItem value="365">365 days (1 year)</SelectItem>
                          <SelectItem value="730">
                            730 days (2 years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Time before automatic transfer
                      </p>
                    </div>

                    {/* Personal Message */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="personal-message">
                        Personal Message (Optional)
                      </Label>
                      <Textarea
                        id="personal-message"
                        placeholder="Leave a personal message for the beneficiary..."
                        value={rule.message}
                        onChange={(e) => updateRule('message', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={rule.percentage === 0 || loading}
                  >
                    {loading
                      ? 'Creating Contract...'
                      : 'Create Inheritance Contract'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold mb-4">
                How Your Inheritance Contract Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                    1
                  </div>
                  <p className="text-sm">
                    Contract monitors your wallet activity on Flow blockchain
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                    2
                  </div>
                  <p className="text-sm">
                    If inactive for the specified period, contract triggers
                    automatically
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                    3
                  </div>
                  <p className="text-sm">
                    Assets are transferred to your beneficiary securely
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification({ ...notification, open })}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </AuthRequired>
  );
}
