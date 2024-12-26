import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { useChainId, useConfig } from 'wagmi';
import WarningIcon from '@mui/icons-material/Warning';
import { switchNetwork, TARGET_CHAIN, TARGET_CHAIN_ID } from '@/constants/networks';

const NetworkWarning = () => {
  const chainId = useChainId();
  const config = useConfig();

  if (chainId === TARGET_CHAIN_ID) return null;

  const currentChain = config.chains.find((chain) => chain.id === chainId);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <WarningIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Wrong Network
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please connect to {TARGET_CHAIN.chainName} Network to use this application.
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Current Network: {currentChain?.name || 'Not Connected'}
          <br />
          Required Network: {TARGET_CHAIN.chainName}
        </Alert>
        <Button variant="contained" color="primary" onClick={switchNetwork} fullWidth>
          Switch to {TARGET_CHAIN.chainName}
        </Button>
      </Paper>
    </Box>
  );
};

export default NetworkWarning;
