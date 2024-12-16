import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2024 Liberdus LP Stake
      </Typography>
    </Box>
  );
};

export default Footer;