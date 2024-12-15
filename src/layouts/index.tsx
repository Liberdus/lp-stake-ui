import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import NotifySnackBar from '@/components/NotifySnackBar';

const Layout:React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 6
        }}
      >
        <Outlet />
      </Box>
      <Footer />
      <NotifySnackBar />
    </Box>
  );
};

export default Layout;
