import { ReminderStatus, TrendIndicator } from '@/types';
import { Check, Clock, AlertCircle, Send, Pause, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatusBadgeProps {
  status: ReminderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    scheduled: {
      label: 'Scheduled',
      className: 'bg-secondary text-secondary-foreground',
      icon: Clock,
    },
    sent: {
      label: 'Sent',
      className: 'bg-primary/10 text-primary',
      icon: Send,
    },
    taken: {
      label: 'Taken',
      className: 'bg-success/10 text-success',
      icon: Check,
    },
    missed: {
      label: 'Missed',
      className: 'bg-destructive/10 text-destructive',
      icon: AlertCircle,
    },
    snoozed: {
      label: 'Snoozed',
      className: 'bg-warning/10 text-warning',
      icon: Pause,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

interface TrendBadgeProps {
  trend: TrendIndicator;
}

export function TrendBadge({ trend }: TrendBadgeProps) {
  const config = {
    improving: {
      label: 'Improving',
      className: 'bg-success/10 text-success',
      icon: TrendingUp,
    },
    stable: {
      label: 'Stable',
      className: 'bg-primary/10 text-primary',
      icon: Minus,
    },
    warning: {
      label: 'Needs Attention',
      className: 'bg-warning/10 text-warning',
      icon: TrendingDown,
    },
  };

  const { label, className, icon: Icon } = config[trend];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}
