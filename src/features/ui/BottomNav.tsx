import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, Clock, UserCheck, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomNavProps {
  onQuickAdd?: () => void;
}

export function BottomNav({ onQuickAdd }: BottomNavProps) {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Groups', icon: Users },
    { to: '/activity', label: 'Activity', icon: Clock },
    // Center action handled separately
    { to: '/friends', label: 'Friends', icon: UserCheck },
    { to: '/profile', label: 'Account', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe sm:max-w-lg sm:mx-auto sm:border-x sm:rounded-t-2xl shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Groups */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors relative',
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Users className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] mt-1">Groups</span>
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>

        {/* Activity */}
        <NavLink
          to="/activity"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors relative',
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Clock className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] mt-1">Activity</span>
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>

        {/* Floating Quick Action Button */}
        {onQuickAdd && (
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={onQuickAdd}
              aria-label="Add Expense"
              className="flex items-center justify-center h-13 w-13 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Friends */}
        <NavLink
          to="/friends"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors relative',
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <UserCheck className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] mt-1">Friends</span>
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-colors relative',
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <User className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] mt-1">Account</span>
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
