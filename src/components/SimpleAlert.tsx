import Alert from '@mui/material/Alert';
import { useAtom } from 'jotai';
import { alertAtom } from '@/store/alert';

const SimpleAlert: React.FC = () => {
  const [alert, setAlert] = useAtom(alertAtom);

  if (!alert || alert.message === '') return null;

  return (
    <Alert variant="outlined" severity={alert.severity} onClose={() => {
      setAlert(null);
    }}>
      {alert.message}
    </Alert>
  );
};

export default SimpleAlert;
