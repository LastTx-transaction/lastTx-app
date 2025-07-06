"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLastTx } from "@/lib/hooks/useLastTx";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthRequired } from "@/components/auth/AuthButton";
import { LastTxService } from "@/lib/lasttx-service";
import { UserProfileService } from "@/lib/services/user-profile.service";
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
  ConfirmDialog,
  NotificationDialog,
} from "@/components/ui/confirm-dialog";
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export default function MyWillsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { lastTxs, loading, refresh, deleteLastTx } = useLastTx();
  const [isClient, setIsClient] = useState(false);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ruleId: string | null;
  }>({
    open: false,
    ruleId: null,
  });
  const [refreshDialog, setRefreshDialog] = useState<{
    open: boolean;
    ruleId: string | null;
  }>({
    open: false,
    ruleId: null,
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
  const [dialogLoading, setDialogLoading] = useState(false);
  const [, setUserHasEmail] = useState<boolean | null>(null);
  const [, setForceRender] = useState(0);
  const [willTransactionIds, setWillTransactionIds] = useState<
    Record<string, string>
  >({});
  const [expiryWarnings, setExpiryWarnings] = useState<
    Record<
      string,
      {
        isExpired: boolean;
        isExpiringSoon: boolean;
        formattedTimeRemaining: string;
      }
    >
  >({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch contract IDs from Supabase when component mounts and user is available
  useEffect(() => {
    const fetchContractIds = async () => {
      if (!user?.addr) return;

      try {
        // Fetch transaction IDs from server (handles Supabase configuration)
        const response = await fetch("/api/get-contract-ids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerAddress: user.addr,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const contractIdsMapping = data.contractIds || {};
          setWillTransactionIds(contractIdsMapping);
        } else {
          console.error("Failed to fetch contract IDs:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching contract IDs:", error);
      }
    };

    if (user?.addr) {
      fetchContractIds();
    }
  }, [user?.addr]); // Only depend on user address

  // Helper function to get transaction ID for a will
  const getWillTransactionId = (willId: string): string | null => {
    return willTransactionIds[willId] || null;
  };

  // Update time every second for countdown display
  useMemo(() => {
    const timer = setInterval(() => {
      setForceRender((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check user email setup and expiry status
  useEffect(() => {
    const checkUserEmailAndExpiry = async () => {
      if (!user?.addr) return;

      try {
        // Check if user has email configured
        const hasEmail = await UserProfileService.hasEmail(user.addr);
        setUserHasEmail(hasEmail);

        // Check expiry status for all wills
        const warnings: {
          [key: string]: {
            isExpired: boolean;
            isExpiringSoon: boolean;
            formattedTimeRemaining: string;
          };
        } = {};
        Object.entries(lastTxs).forEach(([id, will]) => {
          if (will && typeof will === "object") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const willData = will as any;
            const lastActivity = parseFloat(willData.lastActivity ?? "0");
            const inactivityDuration = parseFloat(
              willData.inactivityDuration ?? "0"
            );

            const status = LastTxService.getExpiryStatus(
              lastActivity,
              inactivityDuration
            );
            warnings[id] = {
              isExpired: status.isExpired,
              isExpiringSoon: status.isExpiringSoon,
              formattedTimeRemaining: status.formattedTimeRemaining,
            };
          }
        });
        setExpiryWarnings(warnings);
      } catch (error) {
        console.error("Error checking user email and expiry:", error);
      }
    };

    if (isClient && user?.addr && Object.keys(lastTxs).length > 0) {
      checkUserEmailAndExpiry();
    }
  }, [user?.addr, lastTxs, isClient]);

  // Convert lastTxs array to display format
  const inheritanceRules = lastTxs.map((lastTx) => {
    // Use real-time calculation instead of potentially stale data
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(
      0,
      lastTx.lastActivity + lastTx.inactivityDuration - currentTimestamp
    );
    const daysUntilTrigger = Math.floor(timeRemaining / (24 * 60 * 60));

    let status = "active";
    if (lastTx.isClaimed) status = "inactive";
    else if (timeRemaining <= 0)
      status = "triggered"; // Use real-time calculation
    else if (daysUntilTrigger <= 30) status = "warning";

    const contractAddress =
      willTransactionIds[lastTx.id] || `Will-${lastTx.id}`;

    return {
      id: lastTx.id,
      beneficiaryName: lastTx.beneficiaries[0]?.name ?? "Unknown Beneficiary",
      beneficiaryAddress: lastTx.beneficiaries[0]?.address ?? "",
      percentage: lastTx.beneficiaries[0]?.percentage ?? 100,
      inactivityPeriod: Math.round(lastTx.inactivityDuration / 60), // Store in minutes for better precision
      lastActivity: new Date(lastTx.lastActivity * 1000)
        .toISOString()
        .split("T")[0],
      status,
      token: "FLOW",
      daysUntilTrigger,
      contractAddress,
      rawData: lastTx,
    };
  });

  const refreshActivity = async (ruleId: string) => {
    if (!isAuthenticated) return;

    setDialogLoading(true);
    try {
      if (ruleId === "all") {
        // Fetch fresh data from blockchain first
        let allFreshWills;
        try {
          allFreshWills = await LastTxService.getAllWills(user?.addr || "");
        } catch (error) {
          console.error("Error fetching fresh will data:", error);
          setNotification({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to verify will statuses. Please try again.",
          });
          setDialogLoading(false);
          setRefreshDialog({ open: false, ruleId: null });
          return;
        }

        // Refresh all contracts by sending a pulse to each
        for (const rule of inheritanceRules) {
          const freshWillData = allFreshWills[rule.id];

          if (!freshWillData) {
            console.warn(`Will ${rule.id} not found in fresh data, skipping`);
            continue;
          }

          // Check real-time status for each rule using fresh data
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const timeRemaining = Math.max(
            0,
            freshWillData.lastActivity +
              freshWillData.inactivityDuration -
              currentTimestamp
          );
          const isExpired = timeRemaining <= 0;

          if (!freshWillData.isClaimed && !isExpired) {
            await LastTxService.sendActivityPulse(rule.id);

            // Also update Supabase and Google Cloud Scheduler
            try {
              const transactionId = getWillTransactionId(rule.id);

              await fetch("/api/refresh-will", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  smartContractId: transactionId || `will-${rule.id}`, // Use transaction ID if available, otherwise fallback
                  inactivityPeriodMinutes: rule.inactivityPeriod, // Send in minutes
                  ownerAddress: user?.addr,
                  willId: parseInt(rule.id), // Include willId as number for better mapping
                  currentLastActivity: rule.rawData.lastActivity, // Pass current lastActivity for validation
                }),
              });
            } catch (error) {
              console.error(
                "Error updating scheduling for rule",
                rule.id,
                error
              );
            }
          }
        }

        refresh(); // Refresh to get latest data after successful operations
        setNotification({
          open: true,
          type: "success",
          title: "Success!",
          description: "All active timers refreshed successfully!",
        });
      } else {
        const rule = inheritanceRules.find((r) => r.id === ruleId);

        if (!rule) {
          setNotification({
            open: true,
            type: "error",
            title: "Cannot Refresh",
            description: "Will not found.",
          });
          return;
        }

        // Fetch fresh data from blockchain to check current status
        let freshWillData;
        try {
          const allWills = await LastTxService.getAllWills(user?.addr || "");
          freshWillData = allWills[ruleId];

          if (!freshWillData) {
            setNotification({
              open: true,
              type: "error",
              title: "Cannot Refresh",
              description: "Will not found on blockchain.",
            });
            return;
          }
        } catch (error) {
          console.error("Error fetching fresh will data:", error);
          setNotification({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to verify will status. Please try again.",
          });
          return;
        }

        // Check real-time status using fresh data to prevent refreshing expired wills
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeRemaining = Math.max(
          0,
          freshWillData.lastActivity +
            freshWillData.inactivityDuration -
            currentTimestamp
        );
        const isExpired = timeRemaining <= 0;

        if (freshWillData.isClaimed || isExpired) {
          setNotification({
            open: true,
            type: "error",
            title: "Cannot Refresh",
            description:
              "Only active wills can be refreshed. This will has expired or been claimed since the page was loaded.",
          });
          return;
        }

        await LastTxService.sendActivityPulse(ruleId);

        // Also update Supabase and Google Cloud Scheduler
        try {
          const transactionId = getWillTransactionId(ruleId);

          const response = await fetch("/api/refresh-will", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              smartContractId: transactionId || `will-${ruleId}`, // Use transaction ID if available, otherwise fallback
              inactivityPeriodMinutes: rule.inactivityPeriod, // Send in minutes
              ownerAddress: user?.addr,
              willId: parseInt(ruleId), // Include willId as number for better mapping
              currentLastActivity: rule.rawData.lastActivity, // Pass current lastActivity for validation
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error:", errorData);
          }
        } catch (error) {
          console.error("Error updating scheduling:", error);
        }

        refresh(); // Refresh to get latest data after successful operation
        setNotification({
          open: true,
          type: "success",
          title: "Success!",
          description:
            "Timer refreshed successfully! Execution date has been updated.",
        });
      }
    } catch (error) {
      console.error("Error refreshing activity:", error);
      setNotification({
        open: true,
        type: "error",
        title: "Error",
        description: "Failed to refresh timer. Please try again.",
      });
    } finally {
      setDialogLoading(false);
      setRefreshDialog({ open: false, ruleId: null });
    }
  };

  const editRule = (ruleId: string) => {
    // Navigate to edit page
    router.push(`/edit-rule/${ruleId}`);
  };

  const deleteRule = async (ruleId: string) => {
    setDeleteDialog({ open: true, ruleId });
  };

  const removeTriggeredRule = async (ruleId: string) => {
    setDialogLoading(true);
    try {
      // First verify the will exists and check its status
      let freshWillData;
      try {
        const allWills = await LastTxService.getAllWills(user?.addr || "");
        freshWillData = allWills[ruleId];

        if (!freshWillData) {
          setNotification({
            open: true,
            type: "error",
            title: "Cannot Remove",
            description: "Will not found on blockchain.",
          });
          return;
        }
      } catch (error) {
        console.error("Error fetching fresh will data:", error);
        setNotification({
          open: true,
          type: "error",
          title: "Error",
          description: "Failed to verify will status. Please try again.",
        });
        return;
      }

      const success = await deleteLastTx(ruleId);
      if (success) {
        // Also clean up email notifications
        try {
          const transactionId = getWillTransactionId(ruleId);
          await fetch("/api/delete-will", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              smartContractId: transactionId || `will-${ruleId}`, // Use transaction ID if available, otherwise fallback
              willId: parseInt(ruleId),
              ownerAddress: user?.addr,
            }),
          });
        } catch (error) {
          console.error("Error cleaning up email notifications:", error);
        }

        setNotification({
          open: true,
          type: "success",
          title: "Success!",
          description: "Triggered will removed from display successfully!",
        });
        refresh(); // Refresh the list to remove the deleted item
      } else {
        throw new Error("Remove operation failed");
      }
    } catch (error) {
      console.error("Error removing triggered rule:", error);
      setNotification({
        open: true,
        type: "error",
        title: "Error",
        description: "Failed to remove triggered will. Please try again.",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ruleId) return;

    setDialogLoading(true);
    try {
      // First verify the will exists before deletion
      let freshWillData;
      try {
        const allWills = await LastTxService.getAllWills(user?.addr || "");
        freshWillData = allWills[deleteDialog.ruleId];

        if (!freshWillData) {
          setNotification({
            open: true,
            type: "error",
            title: "Cannot Delete",
            description: "Will not found on blockchain.",
          });
          return;
        }
      } catch (error) {
        console.error("Error fetching fresh will data:", error);
        setNotification({
          open: true,
          type: "error",
          title: "Error",
          description: "Failed to verify will status. Please try again.",
        });
        return;
      }

      const success = await deleteLastTx(deleteDialog.ruleId);
      if (success) {
        // Also clean up email notifications
        try {
          const transactionId = getWillTransactionId(deleteDialog.ruleId);
          await fetch("/api/delete-will", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              smartContractId: transactionId || `will-${deleteDialog.ruleId}`, // Use transaction ID if available, otherwise fallback
              willId: parseInt(deleteDialog.ruleId),
              ownerAddress: user?.addr,
            }),
          });
        } catch (error) {
          console.error("Error cleaning up email notifications:", error);
        }

        setNotification({
          open: true,
          type: "success",
          title: "Success!",
          description: "Inheritance rule deleted successfully!",
        });
        refresh(); // Refresh the list to remove the deleted item
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      setNotification({
        open: true,
        type: "error",
        title: "Error",
        description: "Failed to delete rule. Please try again.",
      });
    } finally {
      setDialogLoading(false);
      setDeleteDialog({ open: false, ruleId: null });
    }
  };

  const triggerRefreshDialog = (ruleId: string) => {
    setRefreshDialog({ open: true, ruleId });
  };

  const handleRefreshConfirm = async () => {
    if (!refreshDialog.ruleId) return;
    await refreshActivity(refreshDialog.ruleId);
  };

  const getStatusBadge = (rule: (typeof inheritanceRules)[0]) => {
    // Use real-time calculation for consistency
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(
      0,
      rule.rawData.lastActivity +
        rule.rawData.inactivityDuration -
        currentTimestamp
    );
    const daysRemaining = timeRemaining / (24 * 60 * 60);

    // Sync with card colors
    if (rule.rawData.isClaimed) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-100"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Claimed
        </Badge>
      );
    } else if (timeRemaining <= 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-100"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Triggered
        </Badge>
      );
    } else if (daysRemaining < 1) {
      // Show countdown when under 1 day
      const timeText = formatCountdown(timeRemaining);
      return (
        <Badge className="bg-red-200 text-red-800 ">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Critical ({timeText})
        </Badge>
      );
    } else if (daysRemaining < 7) {
      return (
        <Badge
          variant="default"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Warning ({Math.floor(daysRemaining)} days left)
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <Clock className="h-3 w-3 mr-1" />
          Active ({Math.floor(daysRemaining)} days left)
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    // Show date in user's local timezone with timezone indicator
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      // Remove timeZone: "UTC" to use user's local timezone
    });
  };

  const getTotalPercentage = () => {
    return inheritanceRules
      .filter((rule) => rule.status !== "triggered")
      .reduce((total, rule) => total + rule.percentage, 0);
  };

  // Helper function to format inactivity period display
  const formatInactivityPeriod = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (minutes < 60 * 24) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(minutes / (60 * 24));
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  // Helper function to format countdown for wills under 24 hours
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      // Show hours and minutes
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      // Show minutes and seconds
      return `${minutes}m ${secs}s remaining`;
    } else {
      // Show just seconds
      return `${secs}s remaining`;
    }
  };

  // Helper function to get card styling based on time remaining
  const getCardStyling = (rule: (typeof inheritanceRules)[0]) => {
    // Use real-time calculation for consistency
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(
      0,
      rule.rawData.lastActivity +
        rule.rawData.inactivityDuration -
        currentTimestamp
    );
    const daysRemaining = timeRemaining / (24 * 60 * 60);

    let className = "border-primary/10 hover:shadow-lg transition-shadow";

    if (rule.rawData.isClaimed || timeRemaining <= 0) {
      className += " border-gray-300 bg-gray-100";
    } else if (daysRemaining < 1) {
      className += " border-red-300 bg-red-50";
    } else if (daysRemaining < 7) {
      className += " border-yellow-300 bg-yellow-50";
    }

    return className;
  };

  // Helper function to get time remaining display
  const getTimeRemainingDisplay = (rule: (typeof inheritanceRules)[0]) => {
    // Use real-time calculation for consistency
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeRemaining = Math.max(
      0,
      rule.rawData.lastActivity +
        rule.rawData.inactivityDuration -
        currentTimestamp
    );
    const hoursRemaining = timeRemaining / 3600;

    if (rule.rawData.isClaimed) return "Claimed";
    if (timeRemaining <= 0) return "Expired";

    // Show countdown if under 24 hours
    if (hoursRemaining < 24) {
      const countdown = formatCountdown(timeRemaining);
      return countdown;
    }

    // Otherwise show expiration date in user's local timezone
    const expirationTime =
      rule.rawData.lastActivity + rule.rawData.inactivityDuration;
    const expirationDate = new Date(expirationTime * 1000);

    // Show time in user's local timezone with clear indication
    return expirationDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short", // Add timezone name for clarity
    });
  };

  // Show loading state
  if (loading || !isClient) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 pt-24 pb-24">
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
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    My Inheritance Rules
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Monitor and manage your inactivity-based inheritance
                    contracts
                  </p>
                </div>
              </div>
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
                          inheritanceRules.filter(
                            (r) => r.status === "triggered"
                          ).length
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
            <Card className="border-primary/10 mb-8">
              <CardContent className="py-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Activity Status
                    </h3>
                    <p className="text-muted-foreground">
                      Last wallet activity:{" "}
                      <span className="font-medium">
                        {inheritanceRules.length > 0
                          ? formatDate(inheritanceRules[0].lastActivity)
                          : "No activity"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Any wallet transaction resets all your inactivity timers
                    </p>
                  </div>
                  <Button
                    onClick={() => triggerRefreshDialog("all")}
                    className="group"
                    disabled={
                      inheritanceRules.filter(
                        (r) => r.status === "active" || r.status === "warning"
                      ).length === 0
                    }
                  >
                    <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                    Refresh All Active Timers
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
                  </CardContent>
                </Card>
              ) : (
                inheritanceRules.map((rule) => {
                  return (
                    <Card key={rule.id} className={getCardStyling(rule)}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>
                              {rule.beneficiaryName} - {rule.percentage}%
                            </span>
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            {/* Expiry Warning Badge */}
                            {expiryWarnings[rule.id]?.isExpired && (
                              <Badge variant="destructive" className="text-xs">
                                🚨 EXPIRED
                              </Badge>
                            )}
                            {expiryWarnings[rule.id]?.isExpiringSoon &&
                              !expiryWarnings[rule.id]?.isExpired && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-orange-100 text-orange-800"
                                >
                                  ⏰ EXPIRING SOON
                                </Badge>
                              )}
                            {getStatusBadge(rule)}
                          </div>
                        </div>
                        <CardDescription>
                          {rule.contractAddress}
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
                              <p className="text-sm font-medium mb-1">
                                Asset Type
                              </p>
                              <Badge variant="outline">{rule.token}</Badge>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Allocation
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                {rule.percentage}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Inactivity Period
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatInactivityPeriod(rule.inactivityPeriod)}
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
                              <p className="text-xs text-muted-foreground">
                                (Local timezone)
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">
                                Expires On
                              </p>
                              <p
                                className={`text-lg font-bold ${(() => {
                                  const timeRemaining =
                                    getTimeRemainingDisplay(rule);
                                  if (timeRemaining === "Claimed")
                                    return "text-gray-600";
                                  if (timeRemaining === "Expired")
                                    return "text-red-600";

                                  // Use real-time calculation for consistency
                                  const currentTimestamp = Math.floor(
                                    Date.now() / 1000
                                  );
                                  const secondsRemaining = Math.max(
                                    0,
                                    rule.rawData.lastActivity +
                                      rule.rawData.inactivityDuration -
                                      currentTimestamp
                                  );
                                  const daysRemaining =
                                    secondsRemaining / (24 * 60 * 60);

                                  if (daysRemaining > 7)
                                    return "text-green-600";
                                  if (daysRemaining > 1)
                                    return "text-yellow-600";
                                  return "text-red-600";
                                })()}`}
                              >
                                {getTimeRemainingDisplay(rule)}
                              </p>
                              {(() => {
                                const timeRemaining =
                                  getTimeRemainingDisplay(rule);
                                // Only show timezone note for full dates, not for countdown or status messages
                                if (
                                  timeRemaining !== "Claimed" &&
                                  timeRemaining !== "Expired" &&
                                  !timeRemaining.includes("h")
                                ) {
                                  return (
                                    <p className="text-xs text-muted-foreground">
                                      (Local timezone)
                                    </p>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                          <div className="flex space-x-2">
                            {(rule.status === "active" ||
                              rule.status === "warning") && (
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
                                  onClick={() => triggerRefreshDialog(rule.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Refresh Timer
                                </Button>
                              </>
                            )}
                            {rule.status === "triggered" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeTriggeredRule(rule.id)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from List
                              </Button>
                            )}
                          </div>
                          {(rule.status === "active" ||
                            rule.status === "warning") && (
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
                  );
                })
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ruleId: null })}
        title="Delete Inheritance Rule"
        description="Are you sure you want to delete this inheritance rule? This action cannot be undone and will permanently remove the rule from your account."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={dialogLoading}
      />

      {/* Refresh Confirmation Dialog */}
      <ConfirmDialog
        open={refreshDialog.open}
        onOpenChange={(open) => setRefreshDialog({ open, ruleId: null })}
        title="Refresh Activity Timer"
        description={
          refreshDialog.ruleId === "all"
            ? "This will reset the activity timer for all your active inheritance rules and update their execution dates. Are you sure you want to continue?"
            : "This will reset the activity timer for this inheritance rule and update its execution date. Are you sure you want to continue?"
        }
        confirmText="Refresh Timer"
        cancelText="Cancel"
        variant="default"
        onConfirm={handleRefreshConfirm}
        loading={dialogLoading}
      />

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
