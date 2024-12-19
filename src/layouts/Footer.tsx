import { Box, Typography, Container, Link, Stack, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            © 2024 Liberdus LP Stake. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <GitHubIcon />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <TwitterIcon />
            </Link>
            <Link
              href="https://telegram.org"
              target="_blank"
              rel="noopener"
              color="inherit"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <TelegramIcon />
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
