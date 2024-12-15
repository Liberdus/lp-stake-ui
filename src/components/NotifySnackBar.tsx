import { SyntheticEvent, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import { useAtom } from 'jotai';
import { notificationAtom } from '@/store/notification';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

export default function NotifySnackBar() {
  const [open, setOpen] = useState(false);
  const handleClose = (event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const [notification] = useAtom(notificationAtom);

  useEffect(() => {
    if (notification && notification.message !== '') {
      setOpen(true);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <Snackbar open={open} autoHideDuration={notification.duration || 6000} onClose={handleClose} className='max-w-[600px]'>
      <Alert onClose={handleClose} severity={notification.severity} variant={notification.variant} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
