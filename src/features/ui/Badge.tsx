import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-700 border-blue-200/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    danger: 'bg-red-50 text-red-700 border-red-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'border border-slate-200 text-slate-700 bg-transparent'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
