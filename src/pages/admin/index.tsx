import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userInfoAtom } from '@/store/userInfo';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Stack, Button } from '@mui/material';
import MultiSignPanel from './components/MultiSignPanel';
import UpdatePairWeightModal from './components/UpdatePairWeightModal';
import RemovePairModal from './components/RemovePairModal';
import HourlyRateModal from './components/HourlyRateModal';
import ChangeSignerModal from './components/ChangeSignerModal';
import AddPairModal from './components/AddPairModal';
import WithdrawalModal from './components/WithdrawalModal';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo] = useAtom(userInfoAtom);
  const [openHourlyRateModal, setOpenHourlyRateModal] = useState(false);
  const [openUpdatePairWeightModal, setOpenUpdatePairWeightModal] = useState(false);
  const [openChangeSignerModal, setOpenChangeSignerModal] = useState(false);
  const [openRemovePairModal, setOpenRemovePairModal] = useState(false);
  const [openAddPairModal, setOpenAddPairModal] = useState(false);
  const [openWithdrawalModal, setOpenWithdrawalModal] = useState(false);

  useEffect(() => {
    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [userInfo.isAdmin, navigate]);

  if (!userInfo.isAdmin) {
    return null;
  }

  return (
    <>
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
              <Button variant="contained" color="primary" onClick={() => setOpenHourlyRateModal(true)}>
                Update Hourly Rate
              </Button>
              <Button variant="contained" color="primary" onClick={() => setOpenAddPairModal(true)}>
                Add Pair
              </Button>
              <Button variant="contained" color="primary" onClick={() => setOpenRemovePairModal(true)}>
                Remove Pair
              </Button>
              <Button variant="contained" color="primary" onClick={() => setOpenUpdatePairWeightModal(true)}>
                Update Pair Weight
              </Button>
              <Button variant="contained" color="primary" onClick={() => setOpenChangeSignerModal(true)}>
                Change Signer
              </Button>
              <Button variant="contained" color="primary" onClick={() => setOpenWithdrawalModal(true)}>
                Withdraw Rewards
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <AddPairModal open={openAddPairModal} onClose={() => setOpenAddPairModal(false)} />
      <HourlyRateModal open={openHourlyRateModal} onClose={() => setOpenHourlyRateModal(false)} />
      <UpdatePairWeightModal open={openUpdatePairWeightModal} onClose={() => setOpenUpdatePairWeightModal(false)} />
      <ChangeSignerModal open={openChangeSignerModal} onClose={() => setOpenChangeSignerModal(false)} />
      <RemovePairModal open={openRemovePairModal} onClose={() => setOpenRemovePairModal(false)} />
      <WithdrawalModal open={openWithdrawalModal} onClose={() => setOpenWithdrawalModal(false)} />
    </>
  );
};

export default Admin;
