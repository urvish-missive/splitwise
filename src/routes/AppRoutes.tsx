import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { GroupDetailPage } from '@/pages/GroupDetailPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { JoinPage } from '@/pages/JoinPage';
import { BottomNav } from '@/features/ui/BottomNav';
import { AddExpenseModal } from '@/features/expenses/components/AddExpenseModal';

export function AppRoutes() {
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const location = useLocation();

  // Hide bottom nav on specific sub-pages if desired, or keep everywhere
  const isJoinPage = location.pathname.startsWith('/join');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/group/:groupId" element={<GroupDetailPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isJoinPage && (
        <BottomNav onQuickAdd={() => setIsQuickExpenseOpen(true)} />
      )}

      {/* Global Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
      />
    </div>
  );
}
