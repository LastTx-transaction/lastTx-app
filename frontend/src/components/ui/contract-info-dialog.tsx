'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Copy,
  Clock,
  Users,
  Shield,
  Calendar,
} from 'lucide-react';

interface ContractData {
  id: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  percentage: number;
  inactivityPeriod: number;
  lastActivity: string;
  status: string;
  daysUntilTrigger: number;
  contractAddress: string;
  rawData?: Record<string, unknown>;
}

interface ContractInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractData: ContractData | null;
  userAddress?: string;
}

export function ContractInfoDialog({
  open,
  onOpenChange,
  contractData,
  userAddress,
}: Readonly<ContractInfoDialogProps>) {
  if (!contractData) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openExplorer = () => {
    const explorerUrl = `https://flowscan.org/account/${userAddress}`;
    window.open(explorerUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'triggered':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <DialogTitle>Contract Information</DialogTitle>
          </div>
          <DialogDescription>
            Detailed information about your inheritance contract on Flow
            blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusColor(contractData.status)}>
              {contractData.status.charAt(0).toUpperCase() +
                contractData.status.slice(1)}
            </Badge>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Contract ID:</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                <span className="truncate">{contractData.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(contractData.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Owner Address:</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                <span className="truncate">{userAddress}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(userAddress || '')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Beneficiary Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Beneficiary:</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">
                  {contractData.beneficiaryName}
                </span>
                <Badge variant="outline">{contractData.percentage}%</Badge>
              </div>
              <div className="text-sm text-gray-600 font-mono">
                {contractData.beneficiaryAddress}
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Inactivity Period:</span>
              </div>
              <div className="text-sm text-gray-600">
                {contractData.inactivityPeriod} days
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Last Activity:</span>
              </div>
              <div className="text-sm text-gray-600">
                {contractData.lastActivity}
              </div>
            </div>
          </div>

          {contractData.status === 'active' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Time Remaining:</span>
              </div>
              <div className="text-sm text-gray-600">
                {contractData.daysUntilTrigger} days
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={openExplorer} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View on FlowScan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
