import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AppBar, Toolbar, Typography, Box, Button, Container, useTheme, useMediaQuery, IconButton, Menu, MenuItem, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { colorModeAtom } from '@/store/colorMode';
import { useAtom } from 'jotai';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import BedtimeIcon from '@mui/icons-material/BedtimeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [colorTheme, setColorTheme] = useAtom(colorModeAtom);

  const toggleColorMode = () => {
    setColorTheme(colorTheme === 'light' ? 'dark' : 'light');
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.8)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: { xs: 1.5, md: 2 },
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                opacity: 0.8,
              },
              transition: 'opacity 0.2s'
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Liberdus LP Staking"
              sx={{
                width: { xs: 32, sm: 36, md: 44 },
                height: { xs: 32, sm: 36, md: 44 },
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(45deg, #fff 30%, #ccc 90%)'
                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Liberdus LP Staking
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ConnectButton accountStatus="avatar" chainStatus="icon" />
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={Link} to="/" onClick={handleClose} selected={location.pathname === '/'}>
                  <HomeIcon sx={{ mr: 1 }} /> Home
                </MenuItem>
                <MenuItem component={Link} to="/admin" onClick={handleClose} selected={location.pathname === '/admin'}>
                  <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin Panel
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                component={Link} 
                to="/" 
                color="inherit"
                startIcon={<HomeIcon />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  backgroundColor: location.pathname === '/' ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'transform 0.2s'
                }}
              >
                Home
              </Button>
              <Button 
                component={Link} 
                to="/admin" 
                color="inherit"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  backgroundColor: location.pathname === '/admin' ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'transform 0.2s'
                }}
              >
                Admin Panel
              </Button>
              <ConnectButton accountStatus="avatar" chainStatus="icon" />
              <IconButton 
                onClick={toggleColorMode}
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                {colorTheme === 'light' ? <LightModeIcon /> : <BedtimeIcon />}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
