import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Modal, Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@/providers/AuthProvider';
import AdminPanel from './components/AdminPanel';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setShowModal(true);
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <Modal 
        open={showModal} 
        onClose={() => navigate('/')}
        aria-labelledby="access-denied-modal"
        aria-describedby="access-denied-description"
        sx={{
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            p: 4,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              width: '100%',
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              },
              borderRadius: 2
            }}
          >
            Access Denied
          </Alert>
          <Typography 
            variant="h6" 
            id="access-denied-description"
            sx={{ 
              textAlign: 'center',
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            You do not have permission to access this page.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              backgroundColor: 'action.hover',
              padding: 2,
              borderRadius: 2,
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={24} thickness={4} />
            <Typography variant="body1" color="text.secondary">
              Redirecting to home page...
            </Typography>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AdminPanel />
    </Container>
  );
};

export default Admin;
