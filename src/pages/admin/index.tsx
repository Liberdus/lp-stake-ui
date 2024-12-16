import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userInfoAtom } from '@/store/userInfo';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid } from '@mui/material';
import MultiSignPanel from './components/MultiSignPanel';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo] = useAtom(userInfoAtom);

  useEffect(() => {
    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [userInfo.isAdmin, navigate]);

  if (!userInfo.isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        Admin Panel
      </Typography>
      <MultiSignPanel />
    </Container>
  );
};

export default Admin;
