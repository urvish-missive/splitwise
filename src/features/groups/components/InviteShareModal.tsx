import React, { useState } from 'react';
import { Group } from '@/types';
import { Sheet } from '@/features/ui/Dialog';
import { Button } from '@/features/ui/Button';
import {
  Copy,
  Check,
  Share2,
  Users,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

interface InviteShareModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteShareModal({ group, isOpen, onClose }: InviteShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const baseUrl = import.meta.env.VITE_APP_URL?.trim() || window.location.origin;
  const inviteLink = `${baseUrl}/join?code=${group.inviteCode}&gid=${group.id}`;
  const shareText = `Join my expense group "${group.name}" on Splitwise to track and split expenses with us! Use invite code: ${group.inviteCode}\n\nJoin here: ${inviteLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy. Please manually copy the link.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      toast.success(`Invite code "${group.inviteCode}" copied!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy code.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name} on Splitwise`,
          text: `Join "${group.name}" on Splitwise! Use invite code: ${group.inviteCode}`,
          url: inviteLink
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      inviteLink
    )}&text=${encodeURIComponent(`Join "${group.name}" on Splitwise! Code: ${group.inviteCode}`)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Invitation to join ${group.name} on Splitwise`);
    const body = encodeURIComponent(
      `Hey!\n\nI'm using Splitwise to track and split expenses for "${group.name}".\n\nClick the link below to join the group:\n${inviteLink}\n\nOr enter invite code: ${group.inviteCode}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSmsShare = () => {
    const body = encodeURIComponent(
      `Join "${group.name}" on Splitwise to split expenses! Code: ${group.inviteCode} ${inviteLink}`
    );
    window.open(`sms:?body=${body}`, '_blank');
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Share Group with Friends"
      description={`Invite anyone to join "${group.name}" and split expenses.`}
    >
      <div className="space-y-4 pt-1">
        {/* Visual Invite Card */}
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 text-center relative overflow-hidden">
          <p className="text-xs uppercase font-bold tracking-wider text-blue-600 mb-1">
            Group Invite Code
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-mono font-extrabold text-blue-900 tracking-wider">
              {group.inviteCode}
            </p>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              title="Copy code"
            >
              {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{group.members.length} current members</span>
          </div>
        </div>

        {/* Quick Social Share Options */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Quick Share Via
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all active:scale-95 border border-emerald-200/60"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-xs">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegramShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-all active:scale-95 border border-sky-200/60"
            >
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center mb-1.5 shadow-xs">
                <Send className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Telegram</span>
            </button>

            {/* SMS / Message */}
            <button
              onClick={handleSmsShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all active:scale-95 border border-amber-200/60"
            >
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center mb-1.5 shadow-xs">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">SMS</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all active:scale-95 border border-purple-200/60"
            >
              <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center mb-1.5 shadow-xs">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">Email</span>
            </button>
          </div>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Group Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-700 focus:outline-none select-all font-mono"
            />
            <Button
              type="button"
              variant={copiedLink ? 'success' : 'default'}
              onClick={handleCopyLink}
              className="shrink-0 h-11 px-4 gap-1.5 font-semibold"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Native Mobile Share Sheet Button */}
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-sm font-semibold border-slate-300 text-slate-800 hover:bg-slate-100 gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="h-4 w-4 text-blue-600" />
            More Share Options (Apps, AirDrop, Nearby)
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
