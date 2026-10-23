import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'pending' | 'approved' | 'rejected';
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  description,
}) => {
  const styles = {
    default: {
      card: 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50',
      iconBox: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
      glow: 'from-zinc-500/10 to-transparent',
    },
    pending: {
      card: 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20',
      iconBox: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
      glow: 'from-amber-500/15 to-transparent',
    },
    approved: {
      card: 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20',
      iconBox: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-500/15 to-transparent',
    },
    rejected: {
      card: 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20',
      iconBox: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
      glow: 'from-rose-500/15 to-transparent',
    },
  }[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-lg backdrop-blur-sm',
        styles.card
      )}
    >
      <div
        className={cn(
          'absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br blur-2xl pointer-events-none',
          styles.glow
        )}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value.toLocaleString()}
          </div>
          {description && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform hover:scale-110',
            styles.iconBox
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
