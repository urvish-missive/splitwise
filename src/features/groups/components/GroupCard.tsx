import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { InviteShareModal } from './InviteShareModal';
import { formatCurrency, GROUP_CATEGORY_INFO, findMemberForUser } from '@/lib/utils';
import { useAppSelector } from '@/app/hooks';
import { calculateGroupBalances } from '@/features/balances/balanceCalculator';
import { ChevronRight, Users, Share2 } from 'lucide-react';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const groupExpenses = allExpenses.filter((e) => e.groupId === group.id);
  const groupSettlements = allSettlements.filter((s) => s.groupId === group.id);

  const { memberBalances } = calculateGroupBalances(
    group.members,
    groupExpenses,
    groupSettlements
  );

  const currentMember = findMemberForUser(group.members, currentUser);
  const userBalance = currentMember ? memberBalances[currentMember.id]?.netBalance || 0 : 0;
  const categoryMeta = GROUP_CATEGORY_INFO[group.category] || GROUP_CATEGORY_INFO.other;

  return (
    <>
      <Card
        onClick={() => navigate(`/group/${group.id}`)}
        className="cursor-pointer hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.99] border-slate-200/90 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          {/* Left: Group Info */}
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs ${categoryMeta.color}`}
            >
              {group.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {categoryMeta.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Net Balance Status */}
          <div className="flex items-center gap-2 text-right">
            <div>
              {Math.abs(userBalance) < 0.01 ? (
                <div>
                  <p className="text-xs font-medium text-slate-500">Settled up</p>
                  <p className="text-sm font-semibold text-slate-600">
                    {formatCurrency(0, group.currency)}
                  </p>
                </div>
              ) : userBalance > 0 ? (
                <div>
                  <p className="text-[11px] font-medium text-emerald-600">You are owed</p>
                  <p className="text-sm font-bold text-emerald-600">
                    +{formatCurrency(userBalance, group.currency)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-medium text-red-600">You owe</p>
                  <p className="text-sm font-bold text-red-600">
                    -{formatCurrency(Math.abs(userBalance), group.currency)}
                  </p>
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>

        {/* Mini Member Avatars Row + 1-Click Share Button */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex -space-x-1.5 overflow-hidden">
            {group.members.slice(0, 4).map((member) => (
              <Avatar
                key={member.id}
                name={member.name}
                size="sm"
                className="border-2 border-white"
              />
            ))}
            {group.members.length > 4 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600 border-2 border-white">
                +{group.members.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Code: <span className="font-mono text-slate-700 font-bold">{group.inviteCode}</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
              title="Share Group Link"
            >
              <Share2 className="h-3 w-3" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </Card>

      <InviteShareModal
        group={group}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
}
