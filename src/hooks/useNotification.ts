import { useAtom } from "jotai";
import { notificationAtom } from "@/store/notification";

const useNotification = () => {
  const [notification, setNotification] = useAtom(notificationAtom);

  const showNotification = (severity: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => {
    setNotification({ message, severity, variant: 'filled', duration: duration || 6000 });
  };

  return { showNotification };
};

export default useNotification;
