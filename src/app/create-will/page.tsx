"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Shield, Clock } from "lucide-react";

interface InheritanceRule {
  beneficiaryAddress: string;
  beneficiaryName: string;
  percentage: number;
  inactivityPeriod: number; // in days
  token: string;
  message: string;
}

export default function CreateWillPage() {
  const [rule, setRule] = useState<InheritanceRule>({
    beneficiaryAddress: "",
    beneficiaryName: "",
    percentage: 0,
    inactivityPeriod: 365,
    token: "FLOW",
    message: "",
  });

  // Mock data for existing rules to show current allocation
  const [existingRules] = useState([
    { percentage: 25, beneficiaryName: "Sarah Johnson" },
    { percentage: 15, beneficiaryName: "Michael Chen" },
  ]);

  const updateRule = (field: keyof InheritanceRule, value: string | number) => {
    setRule((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentTotalAllocation = () => {
    return existingRules.reduce((total, rule) => total + rule.percentage, 0);
  };

  const getNewTotalAllocation = () => {
    return getCurrentTotalAllocation() + rule.percentage;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTotal = getNewTotalAllocation();
    if (newTotal > 100) {
      alert(
        `Total allocation would exceed 100%. Current: ${getCurrentTotalAllocation()}%, New rule: ${
          rule.percentage
        }%, Total would be: ${newTotal}%`
      );
      return;
    }

    if (rule.percentage === 0) {
      alert("Please set a percentage for the inheritance rule.");
      return;
    }

    // TODO: Implement smart contract interaction for the inheritance rule
    console.log("Creating inheritance rule:", rule);
  };

  return (
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

          {/* Current Allocation Status */}
          {/* <Card className="border-blue-200 bg-blue-50/30 mb-8">
            <CardContent className="py-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Current Asset Allocation
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {existingRules.length === 0
                      ? "No inheritance rules created yet"
                      : `${existingRules.length} active rule${
                          existingRules.length > 1 ? "s" : ""
                        } allocating ${getCurrentTotalAllocation()}% of your assets`}
                  </p>
                  {existingRules.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {existingRules.map((existingRule, index) => (
                        <p key={index} className="text-xs text-blue-600">
                          • {existingRule.beneficiaryName}:{" "}
                          {existingRule.percentage}%
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {getCurrentTotalAllocation()}%
                  </div>
                  <div className="text-sm text-blue-700">
                    {100 - getCurrentTotalAllocation()}% available
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Main Form */}
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Create Inheritance Contract</span>
              </CardTitle>
              <CardDescription>
                Create a single inheritance contract with inactivity-based asset
                transfer
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
                        updateRule("beneficiaryName", e.target.value)
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
                        updateRule("beneficiaryAddress", e.target.value)
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
                      max={100 - getCurrentTotalAllocation()}
                      placeholder="25"
                      value={rule.percentage || ""}
                      onChange={(e) =>
                        updateRule("percentage", parseInt(e.target.value) || 0)
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Available: {100 - getCurrentTotalAllocation()}% (max
                      allocation for this rule)
                    </p>
                  </div>

                  {/* Inactivity Period */}
                  <div className="space-y-2">
                    <Label htmlFor="inactivity-period">Inactivity Period</Label>
                    <Select
                      value={rule.inactivityPeriod.toString()}
                      onValueChange={(value) =>
                        updateRule("inactivityPeriod", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1/2">1/2 days (12 hours)</SelectItem>
                        <SelectItem value="1">1 day (1 day)</SelectItem>
                        <SelectItem value="7">7 days (1 week)</SelectItem>
                        <SelectItem value="30">30 days (1 month)</SelectItem>
                        <SelectItem value="90">90 days (3 months)</SelectItem>
                        <SelectItem value="180">180 days (6 months)</SelectItem>
                        <SelectItem value="365">365 days (1 year)</SelectItem>
                        <SelectItem value="730">730 days (2 years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Time before automatic transfer
                    </p>
                  </div>

                  {/* Token Type */}
                  <div className="space-y-2">
                    <Label htmlFor="token-type">Token Type</Label>
                    <Select
                      value={rule.token}
                      onValueChange={(value) => updateRule("token", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          All Assets (FLOW, tokens, NFTs)
                        </SelectItem>
                        <SelectItem value="FLOW">FLOW Only</SelectItem>
                        <SelectItem value="USDC">USDC Only</SelectItem>
                        <SelectItem value="FUSD">FUSD Only</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onChange={(e) => updateRule("message", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* New Total Allocation Preview */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Total Allocation After This Rule:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        getNewTotalAllocation() <= 100 &&
                        getNewTotalAllocation() > getCurrentTotalAllocation()
                          ? "text-green-600"
                          : getNewTotalAllocation() > 100
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {getNewTotalAllocation()}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {rule.percentage === 0
                      ? "Set a percentage for this inheritance rule"
                      : getNewTotalAllocation() > 100
                      ? `This would exceed 100% by ${
                          getNewTotalAllocation() - 100
                        }%. Please reduce the percentage.`
                      : `${
                          100 - getNewTotalAllocation()
                        }% will remain unallocated after this rule.`}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    getNewTotalAllocation() > 100 || rule.percentage === 0
                  }
                >
                  Create Inheritance Contract
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* How it works */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4">
              How Your Inheritance Contracts Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                  1
                </div>
                <p className="text-sm">
                  Each rule creates a separate smart contract monitoring your
                  wallet activity
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                  2
                </div>
                <p className="text-sm">
                  If you don&apos;t use your wallet for the specified period,
                  contracts trigger automatically
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto">
                  3
                </div>
                <p className="text-sm">
                  Your assets are transferred to beneficiaries according to the
                  percentages you set
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
