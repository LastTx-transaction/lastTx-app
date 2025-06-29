'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LastTxDetails } from '@/lib/lasttx-service';
import { Clock, Users, Coins, Activity, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LastTxCardProps {
  lastTx: LastTxDetails;
  onActivityPulse: (id: string) => void;
  onDepositFunds: (id: string) => void;
  onDistributeFunds: (id: string) => void;
}

export function LastTxCard({
  lastTx,
  onActivityPulse,
  onDepositFunds,
  onDistributeFunds,
}: Readonly<LastTxCardProps>) {
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isExpired = lastTx.isExpired;
  const timeRemaining = lastTx.timeRemaining;

  return (
    <Card className={`w-full ${isExpired ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{`LastTx #${lastTx.id}`}</CardTitle>
          <div className="flex items-center gap-2">
            {isExpired ? (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Expired
              </Badge>
            ) : (
              <Badge variant="default">
                <Clock className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span>Balance: {lastTx.balance.toFixed(4)} FLOW</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Beneficiaries: {lastTx.beneficiaries.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span>Last Activity: {formatTime(lastTx.lastActivity)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {isExpired
                ? 'Expired'
                : `Time Left: ${formatDuration(timeRemaining)}`}
            </span>
          </div>
        </div>

        {/* Beneficiaries */}
        <div>
          <h4 className="font-medium mb-2">Beneficiaries</h4>
          <div className="space-y-2">
            {lastTx.beneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.address}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono">
                  {beneficiary.address.slice(0, 8)}...
                  {beneficiary.address.slice(-6)}
                </span>
                <span>{beneficiary.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {!isExpired && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivityPulse(lastTx.id)}
                className="flex-1"
              >
                <Activity className="mr-1 h-3 w-3" />
                Send Pulse
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDepositFunds(lastTx.id)}
                className="flex-1"
              >
                <Coins className="mr-1 h-3 w-3" />
                Deposit
              </Button>
            </>
          )}
          {isExpired && lastTx.balance > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDistributeFunds(lastTx.id)}
              className="w-full"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Distribute Funds
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
