import React, { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { Button } from '@/features/ui/Button';
import { SettleUpModal } from '@/features/balances/components/SettleUpModal';
import { formatCurrency } from '@/lib/utils';
import { calculatePairwiseBalance } from '@/features/balances/balanceCalculator';
import { UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Group, GroupMember } from '@/types';

export function FriendsPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const groups = useAppSelector((state) => state.groups.groups);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);

  const [settleWith, setSettleWith] = useState<{
    friend: GroupMember;
    group: Group;
    amount: number;
    currentUserPays: boolean;
  } | null>(null);

  if (!currentUser) return null;

  // Extract all unique friends
  const friendsMap = new Map<string, { member: GroupMember; sharedGroups: Group[] }>();

  groups.forEach((group) => {
    group.members.forEach((member) => {
      if (member.id !== currentUser.id) {
        if (!friendsMap.has(member.id)) {
          friendsMap.set(member.id, {
            member,
            sharedGroups: [group]
          });
        } else {
          friendsMap.get(member.id)?.sharedGroups.push(group);
        }
      }
    });
  });

  const friendsList = Array.from(friendsMap.values()).map(({ member, sharedGroups }) => {
    // Calculate total net balance across all shared groups with this friend
    const net = calculatePairwiseBalance(
      currentUser.id,
      member.id,
      allExpenses,
      allSettlements
    );
    return {
      member,
      sharedGroups,
      net
    };
  });

  // Sort friends: those with balance first
  friendsList.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto px-4 pt-4 sm:pt-6">
      <div className="pb-4">
        <h1 className="text-xl font-bold text-slate-900">Friends & Balances</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pairwise balances with friends across all shared groups
        </p>
      </div>

      {friendsList.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No friends yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Add friends to an expense group or share an invite code to start splitting.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {friendsList.map(({ member, sharedGroups, net }) => {
            const isSettled = Math.abs(net) < 0.01;
            const friendOwesYou = net > 0;
            const primaryGroup = sharedGroups[0];
            const currency = primaryGroup?.currency || 'INR';

            return (
              <Card key={member.id} className="p-4 border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name={member.name} size="lg" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Shared in {sharedGroups.map((g) => g.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isSettled ? (
                      <div>
                        <p className="text-[11px] text-slate-400">Settled up</p>
                        <p className="text-sm font-semibold text-slate-600">
                          {formatCurrency(0, currency)}
                        </p>
                      </div>
                    ) : friendOwesYou ? (
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-600">
                          owes you
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          +{formatCurrency(net, currency)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] font-semibold text-red-600">
                          you owe
                        </p>
                        <p className="text-sm font-bold text-red-600">
                          -{formatCurrency(Math.abs(net), currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!isSettled && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {friendOwesYou ? `${member.name} pays you` : `You pay ${member.name}`}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() =>
                        setSettleWith({
                          friend: member,
                          group: primaryGroup,
                          amount: Math.abs(net),
                          currentUserPays: !friendOwesYou
                        })
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Settle Up
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {settleWith && (
        <SettleUpModal
          isOpen={!!settleWith}
          onClose={() => setSettleWith(null)}
          group={settleWith.group}
          initialPayerId={
            settleWith.currentUserPays ? currentUser.id : settleWith.friend.id
          }
          initialReceiverId={
            settleWith.currentUserPays ? settleWith.friend.id : currentUser.id
          }
          initialAmount={settleWith.amount}
        />
      )}
    </div>
  );
}
