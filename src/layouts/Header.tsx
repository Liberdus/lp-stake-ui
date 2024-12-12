import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AppBar, Toolbar, Typography, Box, Button, Container, useTheme, useMediaQuery } from '@mui/material';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" color="default" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            flexDirection: { xs: 'column', md: 'row' },
            py: { xs: 2, md: 1 },
            gap: { xs: 2, md: 0 },
            justifyContent: 'space-between'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: { xs: 'center', md: 'flex-start' },
              flexWrap: 'wrap',
              gap: { xs: 1, md: 2 }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Liberdus LP Staking"
                sx={{
                  width: { xs: 28, sm: 32, md: 40 },
                  height: { xs: 28, sm: 32, md: 40 },
                  transition: 'width 0.2s, height 0.2s'
                }}
              />
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                Liber LP Staking
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <Button
                component={Link}
                to="/"
                color="inherit"
                size={isMobile ? "small" : "medium"}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/admin"
                color="inherit"
                size={isMobile ? "small" : "medium"}
              >
                Admin Panel
              </Button>
            </Box>
          </Box>

          <Box sx={{ 
            width: { xs: '100%', md: 'auto' },
            display: 'flex',
            justifyContent: 'center'
          }}>
            <ConnectButton accountStatus={isMobile ? "address" : "avatar"} chainStatus="icon" />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
