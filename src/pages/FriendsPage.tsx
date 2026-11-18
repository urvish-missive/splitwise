import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { Button } from '@/features/ui/Button';
import { Tabs } from '@/features/ui/Tabs';
import { SettleUpModal } from '@/features/balances/components/SettleUpModal';
import { AddContactModal } from '@/features/contacts/components/AddContactModal';
import { deleteContact } from '@/features/contacts/contactsSlice';
import { setUser, setDemoMode } from '@/features/auth/authSlice';
import { saveUserProfileToFirestore } from '@/features/api/firestoreService';
import { formatCurrency, isSamePhone, normalizePhone } from '@/lib/utils';
import { calculatePairwiseBalance } from '@/features/balances/balanceCalculator';
import {
  UserCheck,
  CheckCircle2,
  UserPlus,
  Phone,
  Trash2,
  LogIn,
  ArrowRight,
  BookUser,
  Users
} from 'lucide-react';
import { Group, GroupMember, Contact, UserProfile } from '@/types';
import { toast } from 'sonner';

export function FriendsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.auth.user);
  const groups = useAppSelector((state) => state.groups.groups);
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const allSettlements = useAppSelector((state) => state.expenses.settlements);
  const contacts = useAppSelector((state) => state.contacts.contacts);

  const [activeTab, setActiveTab] = useState<'contacts' | 'balances'>('contacts');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const [settleWith, setSettleWith] = useState<{
    friend: GroupMember;
    group: Group;
    amount: number;
    currentUserPays: boolean;
  } | null>(null);

  if (!currentUser) return null;

  // Extract all unique friends from groups
  const friendsMap = new Map<string, { member: GroupMember; sharedGroups: Group[] }>();

  groups.forEach((group) => {
    group.members.forEach((member) => {
      const isCurrent =
        member.id === currentUser.id ||
        (currentUser.phone && member.phone && isSamePhone(currentUser.phone, member.phone));
      if (!isCurrent) {
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
    // Find current user's ID in this shared context
    const currentMemberId =
      sharedGroups[0]?.members.find(
        (m) =>
          m.id === currentUser.id ||
          (currentUser.phone && m.phone && isSamePhone(currentUser.phone, m.phone))
      )?.id || currentUser.id;

    // Calculate total net balance across all shared groups with this friend
    const net = calculatePairwiseBalance(
      currentMemberId,
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

  // Switch account to this contact to view their personal expenses
  const handleSwitchToContact = (contact: Contact) => {
    // Check if contact has a member id in existing groups
    let memberId = contact.id;
    for (const g of groups) {
      const found = g.members.find((m) => isSamePhone(m.phone, contact.phone));
      if (found) {
        memberId = found.id;
        break;
      }
    }

    const newProfile: UserProfile = {
      id: memberId,
      name: contact.name,
      phone: contact.phone,
      email: contact.email || `${normalizePhone(contact.phone)}@splitwise.local`,
      defaultCurrency: 'INR',
      createdAt: new Date().toISOString()
    };

    dispatch(setUser(newProfile));
    dispatch(setDemoMode(false));
    saveUserProfileToFirestore(newProfile).catch(() => {});
    toast.success(`Switched account to ${contact.name}! Showing their expenses.`);
    navigate('/');
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    if (confirm(`Remove "${contactName}" from your contacts list?`)) {
      dispatch(deleteContact(contactId));
      toast.info(`Contact "${contactName}" removed.`);
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Contacts & Friends</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add contacts with name & number, or view pairwise balances
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddContactOpen(true)}
            className="text-xs h-8 px-2.5 font-semibold gap-1 rounded-xl shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Contact
          </Button>
        </div>

        {/* Tab switch */}
        <div className="mt-3">
          <Tabs
            tabs={[
              { id: 'contacts', label: `Contacts (${contacts.length})` },
              { id: 'balances', label: `Balances (${friendsList.length})` }
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* TAB 1: CONTACTS LIST */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {/* Current Logged In Profile Banner */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Avatar name={currentUser.name} size="sm" />
                <div>
                  <p className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">
                    Currently Logged In As
                  </p>
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  {currentUser.phone && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" /> {currentUser.phone}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {contacts.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <BookUser className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No contacts saved yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Add contacts with Name and Phone Number to split expenses and log in separately.
                </p>
                <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add First Contact
                </Button>
              </Card>
            ) : (
              contacts.map((contact) => {
                const isCurrentlyActive =
                  isSamePhone(currentUser.phone, contact.phone) ||
                  currentUser.id === contact.id;

                // Count shared groups
                const sharedCount = groups.filter((g) =>
                  g.members.some((m) => isSamePhone(m.phone, contact.phone))
                ).length;

                return (
                  <Card
                    key={contact.id}
                    className={`p-3.5 border transition-all ${
                      isCurrentlyActive
                        ? 'border-blue-300 bg-blue-50/30'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar name={contact.name} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                            {isCurrentlyActive && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {contact.phone}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {sharedCount === 0
                              ? 'Not in any group yet'
                              : `In ${sharedCount} ${sharedCount === 1 ? 'group' : 'groups'}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2">
                        {!isCurrentlyActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSwitchToContact(contact)}
                            className="text-xs h-8 px-2.5 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold gap-1 rounded-xl"
                          >
                            <LogIn className="h-3 w-3" />
                            Log In
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            Active
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}

            {/* Bottom Add Contact shortcut */}
            <Button
              variant="outline"
              onClick={() => setIsAddContactOpen(true)}
              className="w-full h-11 border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-xs mt-2"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              + Add Another Contact (Name & Phone)
            </Button>
          </div>
        )}

        {/* TAB 2: PAIRWISE BALANCES */}
        {activeTab === 'balances' && (
          <div>
            {friendsList.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No balances to show</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add friends to groups and record expenses to track who owes whom.
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
                            {member.phone && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5" /> {member.phone}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">
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
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />

      {/* Settle Up Modal */}
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
