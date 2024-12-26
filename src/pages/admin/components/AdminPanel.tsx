import { useState } from 'react';
import { useAtom } from 'jotai';
import { Container, Typography, Grid, Stack, Button, Box } from '@mui/material';
import MultiSignPanel from './MultiSignPanel';
import UpdatePairWeightModal from './UpdatePairWeightModal';
import RemovePairModal from './RemovePairModal';
import HourlyRateModal from './HourlyRateModal';
import ChangeSignerModal from './ChangeSignerModal';
import AddPairModal from './AddPairModal';
import WithdrawalModal from './WithdrawalModal';
import { refetchAtom } from '@/store/refetch';
import InfoCard from './InfoCard';

const AdminPanel: React.FC = () => {
  const [, setRefetch] = useAtom(refetchAtom);
  const [modalOpen, setModalOpen] = useState<number>(0);

  const onClose = () => {
    setModalOpen(0);
    setRefetch(true);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        Admin Panel
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <MultiSignPanel />
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h5" gutterBottom>
            New Proposal
          </Typography>
          <Stack direction="column" spacing={2}>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(1)}>
              Update Hourly Rate
            </Button>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(2)}>
              Add Pair
            </Button>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(3)}>
              Remove Pair
            </Button>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(4)}>
              Update Pair Weight
            </Button>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(5)}>
              Change Signer
            </Button>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(6)}>
              Withdraw Rewards
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <InfoCard />
      </Box>

      <HourlyRateModal open={modalOpen === 1} onClose={onClose} />
      <AddPairModal open={modalOpen === 2} onClose={onClose} />
      <RemovePairModal open={modalOpen === 3} onClose={onClose} />
      <UpdatePairWeightModal open={modalOpen === 4} onClose={onClose} />
      <ChangeSignerModal open={modalOpen === 5} onClose={onClose} />
      <WithdrawalModal open={modalOpen === 6} onClose={onClose} />
    </Container>
  );
};

export default AdminPanel;
