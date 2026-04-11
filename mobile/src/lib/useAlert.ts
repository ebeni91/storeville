import { useState, useCallback } from 'react';
import { AlertButton, AlertVariant } from '../components/ui/CustomAlert';

interface AlertOptions {
  title: string;
  message?: string;
  variant?: AlertVariant;
  buttons?: AlertButton[];
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: '',
  });

  const showAlert = useCallback((opts: AlertOptions) => {
    setAlertState({ ...opts, visible: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  return { alertState, showAlert, hideAlert };
}
