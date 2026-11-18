import React from 'react';
import { Group, GroupBalanceCalculation } from '@/types';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { Badge } from '@/features/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, CheckCircle, Wallet } from 'lucide-react';

interface BalancesSummaryProps {
  group: Group;
  balanceCalculation: GroupBalanceCalculation;
}

export function BalancesSummary({ group, balanceCalculation }: BalancesSummaryProps) {
  const { memberBalances, totalGroupExpenses, totalGroupSettlements } = balanceCalculation;

  return (
    <div className="space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-50/70 border-slate-200/80 p-3.5">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium">Total Spending</span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(totalGroupExpenses, group.currency)}
          </p>
        </Card>

        <Card className="bg-slate-50/70 border-slate-200/80 p-3.5">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium">Total Settled</span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(totalGroupSettlements, group.currency)}
          </p>
        </Card>
      </div>

      {/* Member Balance Breakdown */}
      <Card className="border-slate-200/80">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Member Balances
        </h4>

        <div className="divide-y divide-slate-100">
          {group.members.map((member) => {
            const mb = memberBalances[member.id] || { netBalance: 0 };
            const net = mb.netBalance;
            const isSettled = Math.abs(net) < 0.01;
            const isPositive = net > 0;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center space-x-2.5">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{member.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {isSettled
                        ? 'Settled up'
                        : isPositive
                        ? 'Gets back money'
                        : 'Needs to pay'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {isSettled ? (
                    <Badge variant="neutral">Settled</Badge>
                  ) : isPositive ? (
                    <p className="text-xs font-bold text-emerald-600">
                      +{formatCurrency(net, group.currency)}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-red-600">
                      -{formatCurrency(Math.abs(net), group.currency)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
