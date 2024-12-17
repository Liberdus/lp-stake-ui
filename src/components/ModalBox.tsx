import { Box } from '@mui/material';
import { forwardRef } from 'react';

interface ModalBoxProps {
  children: React.ReactNode;
}

const ModalBox = forwardRef<HTMLDivElement, ModalBoxProps>(({ children }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 600,
        width: '90%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 2,
      }}
    >
      {children}
    </Box>
  );
});

export default ModalBox;
