'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLastTx } from '@/lib/hooks/useLastTx';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthRequired } from '@/components/auth/AuthButton';
import { LastTxService } from '@/lib/lasttx-service';
import { UserProfileService } from '@/lib/services/user-profile.service';
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
  ConfirmDialog,
  NotificationDialog,
} from '@/components/ui/confirm-dialog';
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
  Settings,
} from 'lucide-react';

export default function MyWillsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    lastTxs,
    loading,
    setupAccount,
    accountSetup,
    refresh,
    deleteLastTx,
  } = useLastTx();
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
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    description: '',
  });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [userHasEmail, setUserHasEmail] = useState<boolean | null>(null);
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
          if (will && typeof will === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const willData = will as any;
            const lastActivity = parseFloat(willData.lastActivity ?? '0');
            const inactivityDuration = parseFloat(
              willData.inactivityDuration ?? '0',
            );

            const status = LastTxService.getExpiryStatus(
              lastActivity,
              inactivityDuration,
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
        console.error('Error checking user email and expiry:', error);
      }
    };

    if (isClient && user?.addr && Object.keys(lastTxs).length > 0) {
      checkUserEmailAndExpiry();
    }
  }, [user?.addr, lastTxs, isClient]);

  // Convert lastTxs array to display format
  const inheritanceRules = lastTxs.map((lastTx) => {
    const daysUntilTrigger = Math.max(
      0,
      Math.floor(
        (lastTx.inactivityDuration -
          (Date.now() / 1000 - lastTx.lastActivity)) /
          (24 * 60 * 60),
      ),
    );

    let status = 'active';
    if (lastTx.isClaimed) status = 'inactive';
    else if (lastTx.isExpired) status = 'triggered';
    else if (daysUntilTrigger <= 30) status = 'warning';

    return {
      id: lastTx.id,
      beneficiaryName: lastTx.beneficiaries[0]?.name ?? 'Unknown Beneficiary',
      beneficiaryAddress: lastTx.beneficiaries[0]?.address ?? '',
      percentage: lastTx.beneficiaries[0]?.percentage ?? 100,
      inactivityPeriod: Math.floor(lastTx.inactivityDuration / (24 * 60 * 60)),
      lastActivity: new Date(lastTx.lastActivity * 1000)
        .toISOString()
        .split('T')[0],
      status,
      token: 'FLOW',
      daysUntilTrigger,
      contractAddress: `${user?.addr ?? ''}...${lastTx.id.slice(-6)}`,
      rawData: lastTx,
    };
  });

  const refreshActivity = async (ruleId: string) => {
    if (!isAuthenticated) return;

    setDialogLoading(true);
    try {
      if (ruleId === 'all') {
        // Refresh all contracts by sending a pulse to each
        for (const rule of inheritanceRules) {
          await LastTxService.sendActivityPulse(rule.id);
        }
        refresh();
        setNotification({
          open: true,
          type: 'success',
          title: 'Success!',
          description: 'All timers refreshed successfully!',
        });
      } else {
        await LastTxService.sendActivityPulse(ruleId);
        refresh();
        setNotification({
          open: true,
          type: 'success',
          title: 'Success!',
          description: 'Timer refreshed successfully!',
        });
      }
    } catch (error) {
      console.error('Error refreshing activity:', error);
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        description: 'Failed to refresh timer. Please try again.',
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

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.ruleId) return;

    setDialogLoading(true);
    try {
      const success = await deleteLastTx(deleteDialog.ruleId);
      if (success) {
        setNotification({
          open: true,
          type: 'success',
          title: 'Success!',
          description: 'Inheritance rule deleted successfully!',
        });
        refresh(); // Refresh the list to remove the deleted item
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setNotification({
        open: true,
        type: 'error',
        title: 'Error',
        description: 'Failed to delete rule. Please try again.',
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

  const getStatusBadge = (status: string, daysUntilTrigger: number) => {
    switch (status) {
      case 'active':
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <Clock className="h-3 w-3 mr-1" />
            Active ({daysUntilTrigger} days left)
          </Badge>
        );
      case 'warning':
        return (
          <Badge
            variant="default"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning ({daysUntilTrigger} days left)
          </Badge>
        );
      case 'triggered':
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const getTotalPercentage = () => {
    return inheritanceRules
      .filter((rule) => rule.status !== 'triggered')
      .reduce((total, rule) => total + rule.percentage, 0);
  };

  // Show loading state
  if (loading || !isClient) {
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
                  <Button onClick={setupAccount}>Setup Account</Button>
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
                <div className="flex space-x-3">
                  <Button
                    onClick={() => router.push('/settings')}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                  <Button
                    onClick={() => router.push('/create-will')}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Will</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Setup Warning */}
            {userHasEmail === false && (
              <Card className="mb-8 border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800 mb-1">
                        📧 Set Up Email Notifications
                      </h4>
                      <p className="text-sm text-orange-700 mb-3">
                        To receive important notifications about your
                        inheritance wills (like expiry warnings and claim
                        alerts), please set up your email address.
                      </p>
                      <Button
                        onClick={() => router.push('/settings')}
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set Up Email Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-primary/10">
                <CardContent className="py-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          inheritanceRules.filter((r) => r.status === 'active')
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
                          inheritanceRules.filter((r) => r.status === 'warning')
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
                            (r) => r.status === 'triggered',
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
            <Card className="mb-8 ">
              <CardContent className="py-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Activity Status
                    </h3>
                    <p className="text-muted-foreground">
                      Last wallet activity:{' '}
                      <span className="font-medium">
                        {inheritanceRules.length > 0
                          ? formatDate(inheritanceRules[0].lastActivity)
                          : 'No activity'}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Any wallet transaction resets all your inactivity timers
                    </p>
                  </div>
                  <Button
                    onClick={() => triggerRefreshDialog('all')}
                    className="group"
                    disabled={inheritanceRules.length === 0}
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
                inheritanceRules.map((rule) => {
                  const getCardClassName = () => {
                    let className =
                      'border-primary/10 hover:shadow-lg transition-shadow';

                    // Check expiry status
                    const expiryStatus = expiryWarnings[rule.id];
                    if (expiryStatus?.isExpired) {
                      className += ' border-red-300 bg-red-50/30';
                    } else if (expiryStatus?.isExpiringSoon) {
                      className += ' border-orange-300 bg-orange-50/30';
                    } else if (rule.status === 'warning') {
                      className += ' border-amber-300 bg-amber-50/30';
                    } else if (rule.status === 'triggered') {
                      className += ' border-red-300 bg-red-50/30';
                    }
                    return className;
                  };

                  return (
                    <Card key={rule.id} className={getCardClassName()}>
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
                            {getStatusBadge(rule.status, rule.daysUntilTrigger)}
                          </div>
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
                                className={`text-lg font-bold ${(() => {
                                  if (rule.daysUntilTrigger > 30)
                                    return 'text-green-600';
                                  if (rule.daysUntilTrigger > 7)
                                    return 'text-amber-600';
                                  return 'text-red-600';
                                })()}`}
                              >
                                {rule.status === 'triggered'
                                  ? 'Triggered'
                                  : `${rule.daysUntilTrigger} days`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                          <div className="flex space-x-2">
                            {rule.status !== 'triggered' && (
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
                          </div>
                          {rule.status !== 'triggered' && (
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
          refreshDialog.ruleId === 'all'
            ? 'This will reset the activity timer for all your inheritance rules. Are you sure you want to continue?'
            : 'This will reset the activity timer for this inheritance rule. Are you sure you want to continue?'
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
