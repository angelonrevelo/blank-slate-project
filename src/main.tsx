import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from '@/components/ui/Toast';
import { useToast } from '@/hooks/use-toast';

function AppWithToaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <>
      <App />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithToaster />
  </StrictMode>
);
