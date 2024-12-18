import { useAtom } from 'jotai';
import { alertAtom } from '@/store/alert';

const useAlert = () => {
  const [, setAlert] = useAtom(alertAtom);

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setAlert({ message, severity });
  };

  return { showAlert };
};

export default useAlert;
