'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLastTx } from '@/lib/hooks/useLastTx';
import { AuthRequired } from '@/components/auth/AuthButton';
import { Button } from '@/components/ui/button';
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
import {
  Shield,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InheritanceRule {
  beneficiaryAddress: string;
  beneficiaryName: string;
  percentage: number;
  inactivityPeriod: number;
  message: string;
}

export default function EditRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params?.id as string;
  const { lastTxsById, updateLastTx, refresh } = useLastTx();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [rule, setRule] = useState<InheritanceRule>({
    beneficiaryAddress: '',
    beneficiaryName: '',
    percentage: 100,
    inactivityPeriod: 30,
    message: '',
  });

  const currentRule = lastTxsById[ruleId];

  useEffect(() => {
    if (currentRule) {
      const beneficiary = currentRule.beneficiaries[0];
      const calculatedPeriod = Math.floor(
        currentRule.inactivityDuration / (24 * 60 * 60),
      );

      setRule({
        beneficiaryAddress: beneficiary?.address || '',
        beneficiaryName: beneficiary?.name || '',
        percentage: beneficiary?.percentage || 100,
        inactivityPeriod: calculatedPeriod,
        message: currentRule.personalMessage || '', // Load personal message from blockchain
      });
      setIsLoading(false);
    } else if (ruleId) {
      // Rule not found
      setError('Rule not found');
      setIsLoading(false);
    }
  }, [currentRule, ruleId]);

  const updateRule = (field: keyof InheritanceRule, value: string | number) => {
    setRule((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rule.percentage === 0) {
      setError('Please set a percentage for the inheritance rule.');
      return;
    }

    if (!rule.beneficiaryAddress || !rule.beneficiaryName) {
      setError('Please fill in all required fields.');
      return;
    }

    // Basic Flow address validation
    if (!rule.beneficiaryAddress.startsWith('0x')) {
      setError('Flow address must start with 0x');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Convert days to seconds for smart contract
      const inactivityDurationSeconds = rule.inactivityPeriod * 24 * 60 * 60;

      // Create beneficiary array for smart contract
      const beneficiaries = [
        {
          address: rule.beneficiaryAddress,
          percentage: rule.percentage,
          name: rule.beneficiaryName,
        },
      ];

      // Update LastTx on blockchain
      const success = await updateLastTx(
        ruleId,
        inactivityDurationSeconds,
        beneficiaries,
        rule.message, // Pass personal message to blockchain
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          refresh(); // Refresh the data
          router.push('/my-wills');
        }, 1500);
      } else {
        setError('Failed to update inheritance rule. Please try again.');
      }
    } catch (err) {
      console.error('Error updating rule:', err);
      setError('An error occurred while updating the inheritance rule.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-2xl mx-auto">
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

  if (error && !currentRule) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-red-800">
                    Rule Not Found
                  </h3>
                  <p className="text-red-600 mb-6">
                    The inheritance rule you&apos;re trying to edit was not
                    found.
                  </p>
                  <Button onClick={() => router.push('/my-wills')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Rules
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
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/my-wills')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Rules
              </Button>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Edit Inheritance Rule
              </h1>
              <p className="text-muted-foreground">
                Update the details of your inheritance rule
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Rule updated successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Edit Form */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Inheritance Rule Details</span>
                </CardTitle>
                <CardDescription>
                  Configure who will inherit your crypto assets and when
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Beneficiary Name */}
                    <div className="space-y-2">
                      <Label htmlFor="beneficiary-name">Beneficiary Name</Label>
                      <Input
                        id="beneficiary-name"
                        placeholder="John Doe"
                        value={rule.beneficiaryName}
                        onChange={(e) =>
                          updateRule('beneficiaryName', e.target.value)
                        }
                        disabled={isSaving}
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
                        disabled={isSaving}
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
                        disabled={isSaving}
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
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Current: ${rule.inactivityPeriod} days`}
                          />
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
                        Current setting: {rule.inactivityPeriod} days | Time
                        before automatic transfer
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
                        disabled={isSaving}
                      />
                      <p className="text-xs text-muted-foreground">
                        Personal message that will be accessible to your
                        beneficiary and stored on the blockchain.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/my-wills')}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="min-w-[120px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Rule
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Important Notes
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • Changes will take effect immediately after
                        confirmation
                      </li>
                      <li>
                        • Your activity timer will reset when you make changes
                      </li>
                      <li>
                        • Make sure the beneficiary address is correct and
                        active
                      </li>
                      <li>• This action requires a transaction fee</li>
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
