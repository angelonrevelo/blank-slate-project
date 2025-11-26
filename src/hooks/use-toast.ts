import { useState, useCallback } from 'react';

type ToastType = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [, setToast] = useState<ToastType | null>(null);

  const toast = useCallback((props: ToastType) => {
    setToast(props);
    // Basic console log for now - can be enhanced with actual toast UI
    if (props.variant === 'destructive') {
      console.error(`${props.title}: ${props.description}`);
    } else {
      console.log(`${props.title}: ${props.description}`);
    }
    
    // Auto dismiss after 3 seconds
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast };
}
