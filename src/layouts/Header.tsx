import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { AppBar, Toolbar, Typography, Box, Button, Container, useTheme, useMediaQuery, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="default" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: { xs: 1, md: 1 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
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

          {isMobile ? (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ConnectButton accountStatus="address" chainStatus="icon" />
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={Link} to="/" onClick={handleClose}>Home</MenuItem>
                <MenuItem component={Link} to="/admin" onClick={handleClose}>Admin Panel</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button component={Link} to="/" color="inherit">Home</Button>
              <Button component={Link} to="/admin" color="inherit">Admin Panel</Button>
              <ConnectButton accountStatus="avatar" chainStatus="icon" />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
