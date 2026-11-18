import React, { useEffect, useState } from 'react';
import { GroupMember, SplitType, ExpenseSplit, CurrencyCode } from '@/types';
import { Tabs } from '@/features/ui/Tabs';
import { Avatar } from '@/features/ui/Avatar';
import { Checkbox } from '@/features/ui/Checkbox';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SplitSelectorProps {
  members: GroupMember[];
  totalAmount: number;
  currency: CurrencyCode;
  splitType: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
  splits: ExpenseSplit[];
  onSplitsChange: (splits: ExpenseSplit[]) => void;
  error?: string;
}

export function SplitSelector({
  members,
  totalAmount,
  currency,
  splitType,
  onSplitTypeChange,
  splits,
  onSplitsChange,
  error
}: SplitSelectorProps) {
  // Equal split: which members are checked
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    members.map((m) => m.id)
  );

  // Exact split amounts map
  const [exactAmounts, setExactAmounts] = useState<Record<string, number>>({});

  // Percentage split map
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  // Shares map
  const [shares, setShares] = useState<Record<string, number>>({});

  // Recalculate equal splits
  useEffect(() => {
    if (splitType === 'equal') {
      const activeCount = selectedMemberIds.length;
      if (activeCount === 0 || totalAmount <= 0) {
        onSplitsChange([]);
        return;
      }
      const rawShare = Math.floor((totalAmount / activeCount) * 100) / 100;
      let remaining = Math.round((totalAmount - rawShare * activeCount) * 100) / 100;

      const newSplits: ExpenseSplit[] = selectedMemberIds.map((memberId, idx) => {
        let shareAmount = rawShare;
        if (remaining > 0.009) {
          shareAmount = Math.round((shareAmount + 0.01) * 100) / 100;
          remaining = Math.round((remaining - 0.01) * 100) / 100;
        }
        return {
          memberId,
          amount: shareAmount
        };
      });
      onSplitsChange(newSplits);
    }
  }, [splitType, selectedMemberIds, totalAmount]);

  // Handle equal member toggle
  const toggleMemberEqual = (memberId: string) => {
    if (selectedMemberIds.includes(memberId)) {
      if (selectedMemberIds.length === 1) return; // Keep at least one
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  };

  // Handle exact amount change
  const handleExactChange = (memberId: string, val: string) => {
    const num = parseFloat(val) || 0;
    const updated = { ...exactAmounts, [memberId]: num };
    setExactAmounts(updated);

    const newSplits: ExpenseSplit[] = members.map((m) => ({
      memberId: m.id,
      amount: updated[m.id] || 0
    }));
    onSplitsChange(newSplits);
  };

  // Handle percentage change
  const handlePercentageChange = (memberId: string, val: string) => {
    const pct = parseFloat(val) || 0;
    const updated = { ...percentages, [memberId]: pct };
    setPercentages(updated);

    const newSplits: ExpenseSplit[] = members.map((m) => {
      const p = updated[m.id] || 0;
      const amt = Math.round(((p / 100) * totalAmount) * 100) / 100;
      return {
        memberId: m.id,
        amount: amt,
        percentage: p
      };
    });
    onSplitsChange(newSplits);
  };

  // Handle shares change
  const handleSharesChange = (memberId: string, val: string) => {
    const count = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...shares, [memberId]: count };
    setShares(updated);

    const totalShares = Object.values(updated).reduce((sum, n) => sum + n, 0);
    if (totalShares === 0) {
      onSplitsChange([]);
      return;
    }

    const newSplits: ExpenseSplit[] = members.map((m) => {
      const s = updated[m.id] || 0;
      const amt = Math.round(((s / totalShares) * totalAmount) * 100) / 100;
      return {
        memberId: m.id,
        amount: amt,
        shares: s
      };
    });
    onSplitsChange(newSplits);
  };

  // Status trackers for exact and percentage
  const currentTotalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  const diff = Math.round((totalAmount - currentTotalSplit) * 100) / 100;

  const currentTotalPercentage = Object.values(percentages).reduce((s, p) => s + p, 0);
  const pctDiff = Math.round((100 - currentTotalPercentage) * 100) / 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">Split Method</label>
        {splitType === 'exact' && (
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              Math.abs(diff) < 0.01 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {Math.abs(diff) < 0.01 ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {Math.abs(diff) < 0.01
              ? 'Splits match total'
              : `${formatCurrency(Math.abs(diff), currency)} ${
                  diff > 0 ? 'remaining' : 'over'
                }`}
          </span>
        )}
        {splitType === 'percentage' && (
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              Math.abs(pctDiff) < 0.01 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {Math.abs(pctDiff) < 0.01 ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {Math.abs(pctDiff) < 0.01
              ? '100% allocated'
              : `${Math.abs(pctDiff)}% ${pctDiff > 0 ? 'remaining' : 'over'}`}
          </span>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'equal', label: '= Equal' },
          { id: 'exact', label: '123 Exact' },
          { id: 'percentage', label: '% Percent' },
          { id: 'shares', label: 'Shares' }
        ]}
        activeTab={splitType}
        onChange={(id) => onSplitTypeChange(id as SplitType)}
      />

      {/* Members Split Editor List */}
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white">
        {members.map((member) => {
          const splitItem = splits.find((s) => s.memberId === member.id);
          const isSelected = selectedMemberIds.includes(member.id);

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                {splitType === 'equal' ? (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMemberEqual(member.id)}
                    id={`split-${member.id}`}
                  />
                ) : (
                  <Avatar name={member.name} size="sm" />
                )}
                <span className="text-xs font-medium text-slate-800 line-clamp-1">
                  {member.name}
                </span>
              </div>

              {/* Value controls depending on split type */}
              <div className="flex items-center space-x-2">
                {splitType === 'equal' && (
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-slate-900' : 'text-slate-400 line-through'
                    }`}
                  >
                    {isSelected
                      ? formatCurrency(splitItem?.amount || 0, currency)
                      : formatCurrency(0, currency)}
                  </span>
                )}

                {splitType === 'exact' && (
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-xs text-slate-400">
                      {currency === 'INR' ? '₹' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={exactAmounts[member.id] || ''}
                      onChange={(e) => handleExactChange(member.id, e.target.value)}
                      placeholder="0.00"
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                )}

                {splitType === 'percentage' && (
                  <div className="flex items-center gap-1.5 w-24 justify-end">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={percentages[member.id] || ''}
                      onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                      placeholder="0"
                      className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-right text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                )}

                {splitType === 'shares' && (
                  <div className="flex items-center gap-1.5 w-24 justify-end">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={shares[member.id] || ''}
                      onChange={(e) => handleSharesChange(member.id, e.target.value)}
                      placeholder="1"
                      className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-right text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-xs text-slate-500">shr</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
