import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import NotifySnackBar from '@/components/NotifySnackBar';
import NetworkWarning from '@/components/NetworkWarning';
import { useEffect } from 'react';
import { useChainId } from 'wagmi';
import { REQUIRED_CHAIN_ID } from '@/constants/chains';

const Layout: React.FC = () => {
  const chainId = useChainId();

  useEffect(() => {
    localStorage.setItem('lastVisit', new Date().getTime().toString());
  }, []);

  if (chainId !== REQUIRED_CHAIN_ID) {
    return <NetworkWarning />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
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
          p: 6,
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
