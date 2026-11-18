import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20',
        outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'text-slate-700 hover:bg-slate-100',
        link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20'
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 px-3 text-xs rounded-lg',
        lg: 'h-13 px-6 text-base font-semibold rounded-2xl',
        icon: 'h-10 w-10 p-0 rounded-xl'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
