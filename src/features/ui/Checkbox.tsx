import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  label,
  disabled,
  className
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-800',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
          checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white hover:bg-slate-50'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
