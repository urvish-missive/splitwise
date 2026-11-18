import React, { useState } from 'react';
import { Group, DebtSimplification } from '@/types';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { Avatar } from '@/features/ui/Avatar';
import { formatCurrency } from '@/lib/utils';
import { SettleUpModal } from './SettleUpModal';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface DebtSimplificationCardProps {
  group: Group;
  debts: DebtSimplification[];
}

export function DebtSimplificationCard({ group, debts }: DebtSimplificationCardProps) {
  const [selectedDebt, setSelectedDebt] = useState<DebtSimplification | null>(null);

  const getMember = (id: string) => group.members.find((m) => m.id === id);

  return (
    <>
      <Card className="border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-slate-900">
              Suggested Settlements
            </h4>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Min transfers
          </span>
        </div>

        <div className="pt-3">
          {debts.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Everyone is settled up!</p>
              <p className="text-xs text-slate-400">
                No debts or pending payments in this group.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {debts.map((debt, index) => {
                const fromUser = getMember(debt.fromId);
                const toUser = getMember(debt.toId);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Avatar name={fromUser?.name || 'User'} size="sm" />
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {fromUser?.name}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {toUser?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(debt.amount, group.currency)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-2.5 border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => setSelectedDebt(debt)}
                      >
                        Settle
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {selectedDebt && (
        <SettleUpModal
          isOpen={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
          group={group}
          initialPayerId={selectedDebt.fromId}
          initialReceiverId={selectedDebt.toId}
          initialAmount={selectedDebt.amount}
        />
      )}
    </>
  );
}
