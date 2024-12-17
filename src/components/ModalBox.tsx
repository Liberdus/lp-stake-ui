import { Box } from '@mui/material';

interface ModalBoxProps {
  children: React.ReactNode;
}

export const ModalBox: React.FC<ModalBoxProps> = ({ children }) => {
  return (
    <Box
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
};
