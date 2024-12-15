import { useAtom } from "jotai";
import { notificationAtom } from "@/store/notification";

const useNotification = () => {
  const [notification, setNotification] = useAtom(notificationAtom);

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, severity, variant: 'filled', duration: 6000 });
  };

  return { showNotification };
};

export default useNotification;
