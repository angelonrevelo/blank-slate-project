import { X } from 'lucide-react';
import type { Toast as ToastType, ToastVariant } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-card border-border',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
  destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
  info: 'bg-primary/10 border-primary/20 text-primary',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-right',
        variantStyles[toast.variant || 'default']
      )}
    >
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-90 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster({ toasts, onDismiss }: { toasts: ToastType[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
