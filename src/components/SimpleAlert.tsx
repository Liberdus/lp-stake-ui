import Alert from '@mui/material/Alert';
import { useAtom } from 'jotai';
import { alertAtom } from '@/store/alert';

const SimpleAlert: React.FC = () => {
  const [alert] = useAtom(alertAtom);

  if (!alert || alert.message === '') return null;

  return (
    <Alert variant="filled" severity={alert.severity}>
      {alert.message}
    </Alert>
  );
};

export default SimpleAlert;
