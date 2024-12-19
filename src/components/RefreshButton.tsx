import { IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, loading = false }) => {
  return (
    <Tooltip title="Refresh data">
      <IconButton
        onClick={onClick}
        disabled={loading}
        sx={{
          animation: loading ? 'spin 1s linear infinite' : 'none',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton; 