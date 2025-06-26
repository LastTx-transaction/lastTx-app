"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

// Mock data - in a real app, this would come from the blockchain
const mockInheritanceRules = [
  {
    id: "rule_001",
    beneficiaryName: "Sarah Johnson",
    beneficiaryAddress: "0x1234...5678",
    percentage: 60,
    inactivityPeriod: 365, // days
    lastActivity: "2024-01-15",
    status: "active",
    token: "ALL",
    daysUntilTrigger: 340,
    contractAddress: "0xabc123...def456",
  },
  {
    id: "rule_002",
    beneficiaryName: "Michael Chen",
    beneficiaryAddress: "0x9876...5432",
    percentage: 25,
    inactivityPeriod: 180,
    lastActivity: "2024-01-15",
    status: "warning", // getting close to trigger
    token: "FLOW",
    daysUntilTrigger: 25,
    contractAddress: "0xdef789...abc123",
  },
  {
    id: "rule_003",
    beneficiaryName: "Emma Davis",
    beneficiaryAddress: "0xabcd...efgh",
    percentage: 15,
    inactivityPeriod: 90,
    lastActivity: "2023-12-01",
    status: "triggered", // already executed
    token: "USDC",
    daysUntilTrigger: 0,
    contractAddress: "0x123abc...456def",
  },
];

export default function MyWillsPage() {
  const [inheritanceRules] = useState(mockInheritanceRules);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshActivity = (ruleId: string) => {
    // TODO: Implement wallet activity refresh
    console.log("Refreshing activity timer for rule:", ruleId);
  };

  const editRule = (ruleId: string) => {
    // TODO: Navigate to edit page or open modal
    console.log("Editing rule:", ruleId);
  };

  const deleteRule = (ruleId: string) => {
    // TODO: Implement rule deletion
    console.log("Deleting rule:", ruleId);
  };

  const getStatusBadge = (status: string, daysUntilTrigger: number) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Clock className="h-3 w-3 mr-1" />
            Active ({daysUntilTrigger} days left)
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="default"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning ({daysUntilTrigger} days left)
          </Badge>
        );
      case "triggered":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Triggered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getTotalPercentage = () => {
    return inheritanceRules
      .filter((rule) => rule.status !== "triggered")
      .reduce((total, rule) => total + rule.percentage, 0);
  };

  // Prevent hydration mismatch by waiting for client-side rendering
  if (!isClient) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Inheritance Rules
            </h1>
            <p className="text-xl text-muted-foreground">
              Monitor and manage your inactivity-based inheritance contracts
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/10">
              <CardContent className="py-1">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        inheritanceRules.filter((r) => r.status === "active")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active Rules
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardContent className="py-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        inheritanceRules.filter((r) => r.status === "warning")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Need Attention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardContent className="py-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        inheritanceRules.filter((r) => r.status === "triggered")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Triggered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardContent className="py-1">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {getTotalPercentage()}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Allocated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 ">
            <CardContent className="py-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Activity Status
                  </h3>
                  <p className="text-muted-foreground">
                    Last wallet activity:{" "}
                    <span className="font-medium">
                      {formatDate("2024-01-15")}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Any wallet transaction resets all your inactivity timers
                  </p>
                </div>
                <Button
                  onClick={() => refreshActivity("all")}
                  className="group"
                >
                  <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                  Refresh All Timers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inheritance Rules List */}
          <div className="space-y-6">
            {inheritanceRules.length === 0 ? (
              <Card className="border-primary/10">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No inheritance rules created yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start securing your crypto inheritance by creating your
                    first inheritance rule
                  </p>
                  <Button asChild>
                    <a href="/create-will">Create Your First Rule</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              inheritanceRules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`border-primary/10 hover:shadow-lg transition-shadow ${
                    rule.status === "warning"
                      ? "border-amber-300 bg-amber-50/30"
                      : rule.status === "triggered"
                      ? "border-red-300 bg-red-50/30"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>
                          {rule.beneficiaryName} - {rule.percentage}%
                        </span>
                      </CardTitle>
                      {getStatusBadge(rule.status, rule.daysUntilTrigger)}
                    </div>
                    <CardDescription>
                      Contract: {rule.contractAddress}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Beneficiary
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rule.beneficiaryName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {rule.beneficiaryAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Asset Type</p>
                          <Badge variant="outline">{rule.token}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Allocation</p>
                          <p className="text-2xl font-bold text-primary">
                            {rule.percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Inactivity Period
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rule.inactivityPeriod} days
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Last Activity
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(rule.lastActivity)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Days Until Trigger
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              rule.daysUntilTrigger > 30
                                ? "text-green-600"
                                : rule.daysUntilTrigger > 7
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {rule.status === "triggered"
                              ? "Triggered"
                              : `${rule.daysUntilTrigger} days`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Contract
                        </Button>
                        {rule.status !== "triggered" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editRule(rule.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Rule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refreshActivity(rule.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Timer
                            </Button>
                          </>
                        )}
                      </div>
                      {rule.status !== "triggered" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add New Rule */}
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <a href="/create-will">
                <Plus className="h-5 w-5 mr-2" />
                Add New Inheritance Rule
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
