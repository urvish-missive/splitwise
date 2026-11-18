import React, { useState } from 'react';
import { Group } from '@/types';
import { Dialog } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import { Copy, Check, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface InviteShareModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteShareModal({ group, isOpen, onClose }: InviteShareModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join?code=${group.inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please manually copy the link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name} on Splitwise`,
          text: `Join "${group.name}" to track and split expenses with us! Use invite code: ${group.inviteCode}`,
          url: inviteLink
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Friends to Group"
      description={`Share this invite code or link so others can join "${group.name}".`}
    >
      <div className="space-y-4 pt-2">
        {/* Visual Invite Card */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
          <p className="text-xs uppercase font-semibold tracking-wider text-blue-600 mb-1">
            Group Invite Code
          </p>
          <p className="text-3xl font-mono font-extrabold text-blue-900 tracking-wider">
            {group.inviteCode}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Currently {group.members.length} members</span>
          </div>
        </div>

        {/* Copy Link input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Shareable Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 focus:outline-none select-all font-mono"
            />
            <Button
              type="button"
              variant={copied ? 'success' : 'outline'}
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Share Action */}
        <div className="pt-2">
          <Button
            type="button"
            className="w-full h-12"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share with Friends
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
