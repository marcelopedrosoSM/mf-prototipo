import { computed, reactive } from 'vue';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;
const DEFAULT_TOAST_DURATION = 5000;

export type ToastVariant = 'default' | 'success' | 'destructive' | 'info' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ToastState {
  toasts: Toast[];
}

let count = 0;

function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const state = reactive<ToastState>({
  toasts: [],
});

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const toastDismissTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    removeToast(toastId);
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const removeToast = (toastId?: string) => {
  if (toastId === undefined) {
    toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    toastTimeouts.clear();
    toastDismissTimeouts.forEach((timeout) => clearTimeout(timeout));
    toastDismissTimeouts.clear();
    state.toasts = [];
    return;
  }

  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }

  const dismissTimeout = toastDismissTimeouts.get(toastId);
  if (dismissTimeout) {
    clearTimeout(dismissTimeout);
    toastDismissTimeouts.delete(toastId);
  }

  state.toasts = state.toasts.filter((t) => t.id !== toastId);
};

const dismissToast = (toastId?: string) => {
  if (toastId) {
    const dismissTimeout = toastDismissTimeouts.get(toastId);
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      toastDismissTimeouts.delete(toastId);
    }
    addToRemoveQueue(toastId);
  } else {
    state.toasts.forEach((toast) => {
      addToRemoveQueue(toast.id);
    });
  }

  state.toasts = state.toasts.map((t) =>
    t.id === toastId || toastId === undefined
      ? {
          ...t,
          open: false,
        }
      : t
  );
};

export function toast(options: Omit<Toast, 'id' | 'open'>) {
  const id = genId();
  const toastDuration = options.duration ?? DEFAULT_TOAST_DURATION;

  const update = (props: Partial<Toast>) => {
    const index = state.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.toasts[index] = { ...state.toasts[index], ...props, id };
    }
  };

  const dismiss = () => {
    const dismissTimeout = toastDismissTimeouts.get(id);
    if (dismissTimeout) {
      clearTimeout(dismissTimeout);
      toastDismissTimeouts.delete(id);
    }
    dismissToast(id);
  };

  const newToast: Toast = {
    ...options,
    id,
    duration: toastDuration,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dismiss();
    },
  };

  state.toasts = [newToast, ...state.toasts].slice(0, TOAST_LIMIT);

  if (toastDuration > 0) {
    const dismissTimeout = setTimeout(() => {
      dismiss();
    }, toastDuration);
    toastDismissTimeouts.set(id, dismissTimeout);
  }

  return {
    id,
    dismiss,
    update,
  };
}

export function useToast() {
  const toasts = computed(() => [...state.toasts]);

  return {
    toasts,
    toast,
    dismiss: dismissToast,
    // Mantém a mesma interface pública para compatibilidade
    success: (title: string, description?: string, duration?: number) => {
      toast({ title, description, variant: 'success', duration });
    },
    error: (title: string, description?: string, duration?: number) => {
      toast({ title, description, variant: 'destructive', duration });
    },
    info: (title: string, description?: string, duration?: number) => {
      toast({ title, description, variant: 'info', duration });
    },
    warning: (title: string, description?: string, duration?: number) => {
      toast({ title, description, variant: 'warning', duration });
    },
  };
}
