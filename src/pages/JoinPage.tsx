import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addMemberToGroup } from '@/features/groups/groupsSlice';
import { Card } from '@/features/ui/Card';
import { Button } from '@/features/ui/Button';
import { Input } from '@/features/ui/Input';
import { Avatar } from '@/features/ui/Avatar';
import { toast } from 'sonner';
import { LogIn, Users, Sparkles, ArrowLeft } from 'lucide-react';

export function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.groups.groups);
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);

  const matchingGroup = groups.find(
    (g) => g.inviteCode.toUpperCase() === code.trim().toUpperCase()
  );

  const handleJoin = () => {
    if (!matchingGroup) {
      toast.error('No group found for this code.');
      return;
    }
    if (!currentUser) return;

    const alreadyJoined = matchingGroup.memberIds.includes(currentUser.id);
    if (!alreadyJoined) {
      dispatch(
        addMemberToGroup({
          groupId: matchingGroup.id,
          member: {
            id: currentUser.id,
            name: `${currentUser.name} (You)`,
            email: currentUser.email,
            isRegistered: true
          }
        })
      );
      toast.success(`Joined "${matchingGroup.name}"!`);
    }
    navigate(`/group/${matchingGroup.id}`);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto pb-24">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs flex items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </header>

      <div className="px-4 pt-6">
        <Card className="p-6 border-slate-200/80 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-bold text-slate-900">Join Expense Group</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter or confirm the group invite code to start splitting expenses.
          </p>

          <div className="mt-6">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GOA-4821"
              className="text-center font-mono uppercase text-lg font-bold tracking-widest"
            />
          </div>

          {matchingGroup && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {matchingGroup.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3" />
                    {matchingGroup.members.length} members
                  </p>
                </div>
                <div className="flex -space-x-1.5">
                  {matchingGroup.members.slice(0, 3).map((m) => (
                    <Avatar key={m.id} name={m.name} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleJoin}
              disabled={!matchingGroup}
              className="w-full h-12 text-base font-semibold"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {matchingGroup ? `Join ${matchingGroup.name}` : 'Enter Valid Code'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
