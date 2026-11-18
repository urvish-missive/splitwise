import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base font-medium',
  xl: 'h-14 w-14 text-lg font-bold'
};

const bgColors = [
  'bg-blue-500 text-white',
  'bg-emerald-500 text-white',
  'bg-violet-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-indigo-500 text-white'
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index];
}

export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      <div
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow-xs',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none ring-2 ring-white shadow-xs',
        sizeClasses[size],
        getColor(name),
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
