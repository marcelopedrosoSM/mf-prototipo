import type { ActivityStatus } from '@/types/activity';
import type { BadgeVariants } from '@/components/ui/badge';

export interface StatusMetadata {
    label: string;
    variant: NonNullable<BadgeVariants['variant']>;
    colorClass: string;
    bgColorClass: string;
    dotClass: string;
}

export const ACTIVITY_STATUS_METADATA: Record<ActivityStatus | 'overdue', StatusMetadata> = {
    pending: {
        label: 'Pendente',
        variant: 'warning',
        colorClass: 'text-blue-600 dark:text-blue-400',
        bgColorClass: 'bg-blue-100 dark:bg-blue-900/30',
        dotClass: 'bg-blue-500',
    },
    in_progress: {
        label: 'Em Andamento',
        variant: 'warning',
        colorClass: 'text-yellow-600 dark:text-yellow-400',
        bgColorClass: 'bg-yellow-100 dark:bg-yellow-900/30',
        dotClass: 'bg-yellow-500',
    },
    completed: {
        label: 'Concluída',
        variant: 'success',
        colorClass: 'text-green-600 dark:text-green-400',
        bgColorClass: 'bg-green-100 dark:bg-green-900/30',
        dotClass: 'bg-green-500',
    },
    skipped: {
        label: 'Ignorada',
        variant: 'outline',
        colorClass: 'text-slate-600 dark:text-slate-400',
        bgColorClass: 'bg-slate-100 dark:bg-slate-800',
        dotClass: 'bg-slate-400',
    },
    failed: {
        label: 'Falhou',
        variant: 'destructive',
        colorClass: 'text-red-600 dark:text-red-400',
        bgColorClass: 'bg-red-100 dark:bg-red-900/30',
        dotClass: 'bg-red-500',
    },
    overdue: {
        label: 'Atrasada',
        variant: 'destructive',
        colorClass: 'text-orange-600 dark:text-orange-400',
        bgColorClass: 'bg-orange-100 dark:bg-orange-900/30',
        dotClass: 'bg-orange-500',
    },
};

export const getStatusMetadata = (status: ActivityStatus | 'overdue') => {
    return ACTIVITY_STATUS_METADATA[status] || ACTIVITY_STATUS_METADATA.pending;
};
