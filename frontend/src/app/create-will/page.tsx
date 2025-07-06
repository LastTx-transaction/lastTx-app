"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLastTx } from "@/lib/hooks/useLastTx";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthRequired } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { NotificationDialog } from "@/components/ui/confirm-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Clock, Mail } from "lucide-react";
import { UserProfileService } from "@/lib/services/user-profile.service";

interface InheritanceRule {
  beneficiaryAddress: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  percentage: number;
  inactivityPeriod: number; // in days (can be decimal for minutes/hours)
  token: string;
  message: string;
}

export default function CreateWillPage() {
  const router = useRouter();
  const { createWill, loading, accountSetup, setupAccount } = useLastTx();
  const { user } = useAuth();

  const [rule, setRule] = useState<InheritanceRule>({
    beneficiaryAddress: "",
    beneficiaryName: "",
    beneficiaryEmail: "",
    percentage: 100,
    inactivityPeriod: 365,
    token: "FLOW",
    message: "",
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }>({
    open: false,
    type: "success",
    title: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setShowEmailPrompt] = useState(false);

  // Check if user has email set up
  useEffect(() => {
    const checkUserEmail = async () => {
      if (!user?.addr) return;

      try {
        const hasEmail = await UserProfileService.hasEmail(user.addr);

        // Show prompt if user doesn't have email
        if (!hasEmail) {
          setShowEmailPrompt(true);
        }
      } catch (error) {
        console.error("Error checking user email:", error);
      }
    };

    checkUserEmail();
  }, [user?.addr]);

  const updateRule = (field: keyof InheritanceRule, value: string | number) => {
    setRule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validation
    if (rule.percentage <= 0 || rule.percentage > 100) {
      setNotification({
        open: true,
        type: "error",
        title: "Validation Error",
        description:
          "Please set a valid percentage (1-100) for the inheritance rule.",
      });
      return;
    }

    if (
      !rule.beneficiaryAddress ||
      !rule.beneficiaryName ||
      !rule.beneficiaryEmail
    ) {
      setNotification({
        open: true,
        type: "error",
        title: "Missing Information",
        description:
          "Please fill in beneficiary name, email, and wallet address.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rule.beneficiaryEmail)) {
      setNotification({
        open: true,
        type: "error",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert days to seconds for smart contract
      const inactivityDurationSeconds = rule.inactivityPeriod * 24 * 60 * 60;

      // Create will on blockchain with email
      const transactionId = await createWill(
        rule.beneficiaryAddress,
        rule.percentage,
        inactivityDurationSeconds,
        rule.beneficiaryName,
        rule.message,
        rule.beneficiaryEmail // Include email
      );

      if (!transactionId) {
        setNotification({
          open: true,
          type: "error",
          title: "Creation Failed",
          description: "Failed to create inheritance rule. Please try again.",
        });
        return;
      }

      // Save to Supabase and schedule with Google Cloud Scheduler
      try {
        if (user?.addr) {
          const userProfile = await UserProfileService.getUserProfile(
            user.addr
          );

          // Calculate execution date based on inactivity period
          const executionDate = new Date();
          executionDate.setDate(
            executionDate.getDate() + rule.inactivityPeriod
          );

          const willData = {
            smartContractId: transactionId,
            dateOfExecution: executionDate.toISOString(),
            recipientName: rule.beneficiaryName,
            recipientEmail: rule.beneficiaryEmail,
            message: rule.message,
            percentageOfMoney: rule.percentage,
            ownerAddress: user.addr,
            ownerEmail: userProfile?.email,
            ownerName: userProfile?.name || "Will Creator",
          };

          // Call our API to save and schedule
          const response = await fetch("/api/create-will", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(willData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error:", errorData);
            throw new Error(errorData.error || "Failed to save will data");
          }

          const result = await response.json();
          console.log("Will saved and scheduled:", result);
        }
      } catch (error) {
        console.error("Error saving will data or sending email:", error);
        // Don't fail the whole transaction if this fails, but log it
        setNotification({
          open: true,
          type: "success",
          title: "Warning",
          description:
            "Will created on blockchain but there was an issue with scheduling. Please contact support.",
        });
        return;
      }

      setNotification({
        open: true,
        type: "success",
        title: "Will Created Successfully! 🎉",
        description: `Your inheritance will has been created. ${rule.beneficiaryName} will be notified via email for future collection.`,
      });

      // Reset form after success
      setTimeout(() => {
        router.push("/my-wills");
      }, 2000);
    } catch (error) {
      console.error("Error creating will:", error);
      setNotification({
        open: true,
        type: "error",
        title: "Transaction Failed",
        description: "Failed to create inheritance will. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show setup UI if account not configured
  if (!accountSetup) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 pt-12 pb-24">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Shield className="h-6 w-6" />
                    <span>Setup Required</span>
                  </CardTitle>
                  <CardDescription>
                    Your account needs to be set up before creating inheritance
                    rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will initialize your inheritance collection on the Flow
                    blockchain.
                  </p>
                  <Button
                    onClick={setupAccount}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Setting up..." : "Setup Account"}
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
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create Inheritance Will
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
                  <h2 className="text-xl">Create Inheritance Contract</h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Beneficiary Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Beneficiary Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Beneficiary Name */}
                      <div className="space-y-2">
                        <Label htmlFor="beneficiary-name">
                          Beneficiary Name *
                        </Label>
                        <Input
                          id="beneficiary-name"
                          placeholder="e.g., John Doe"
                          value={rule.beneficiaryName}
                          onChange={(e) =>
                            updateRule("beneficiaryName", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Beneficiary Email */}
                      <div className="space-y-2">
                        <Label htmlFor="beneficiary-email">
                          Beneficiary Email *
                        </Label>
                        <Input
                          id="beneficiary-email"
                          type="email"
                          placeholder="john@example.com"
                          value={rule.beneficiaryEmail}
                          onChange={(e) =>
                            updateRule("beneficiaryEmail", e.target.value)
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Email notifications will be sent to this address
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Beneficiary Address */}
                      <div className="space-y-2">
                        <Label htmlFor="beneficiary-address">
                          Beneficiary Wallet Address *
                        </Label>
                        <Input
                          id="beneficiary-address"
                          placeholder="0x... (Flow wallet address)"
                          value={rule.beneficiaryAddress}
                          onChange={(e) =>
                            updateRule("beneficiaryAddress", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Percentage */}
                      <div className="space-y-2">
                        <Label htmlFor="percentage">Asset Percentage *</Label>
                        <Input
                          id="percentage"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="100"
                          value={rule.percentage}
                          onChange={(e) =>
                            updateRule(
                              "percentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage of assets to transfer (1-100%)
                        </p>
                      </div>
                    </div>
                    {/* Personal Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Personal Message (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="A personal message for your beneficiary..."
                        value={rule.message}
                        onChange={(e) => updateRule("message", e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        This message will be included in the inheritance
                        contract
                      </p>
                    </div>
                  </div>

                  {/* Inactivity Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Inactivity Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Inactivity Period */}
                      <div className="space-y-2">
                        <Label htmlFor="inactivity-period">
                          Inactivity Period (Days) *
                        </Label>
                        <Select
                          value={rule.inactivityPeriod.toString()}
                          onValueChange={(value) =>
                            updateRule("inactivityPeriod", parseFloat(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.000694">
                              1 minute (Testing)
                            </SelectItem>
                            <SelectItem value="0.00347">
                              5 minutes (Testing)
                            </SelectItem>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="30">
                              30 days (1 month)
                            </SelectItem>
                            <SelectItem value="90">
                              90 days (3 months)
                            </SelectItem>
                            <SelectItem value="180">
                              180 days (6 months)
                            </SelectItem>
                            <SelectItem value="365">
                              365 days (1 year)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Time period after which inheritance can be claimed if
                          no activity
                        </p>
                      </div>

                      {/* Token Type */}
                      <div className="space-y-2">
                        <Label htmlFor="token">Token Type</Label>
                        <Select
                          value={rule.token}
                          onValueChange={(value) => updateRule("token", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FLOW">FLOW</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Currently supports FLOW tokens only
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full cursor-pointer hover:bg-green-800 transition-colors duration-200"
                      size="lg"
                    >
                      {isSubmitting ? "Creating Will " : "Create Will "}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification({ ...notification, open })}
        type={notification.type}
        title={notification.title}
        description={notification.description}
      />
    </AuthRequired>
  );
}
