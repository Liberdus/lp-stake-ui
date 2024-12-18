import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userInfoAtom } from '@/store/userInfo';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Stack, Button, Modal } from '@mui/material';
import MultiSignPanel from './components/MultiSignPanel';
import UpdatePairWeightModal from './components/UpdatePairWeightModal';
import RemovePairModal from './components/RemovePairModal';
import HourlyRateModal from './components/HourlyRateModal';
import ChangeSignerModal from './components/ChangeSignerModal';
import AddPairModal from './components/AddPairModal';
import WithdrawalModal from './components/WithdrawalModal';
import { refetchAtom } from '@/store/refetch';
import ModalBox from '@/components/ModalBox';
import { useAuth } from '@/providers/AuthProvider';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo] = useAtom(userInfoAtom);
  const [, setRefetch] = useAtom(refetchAtom);
  const [modalOpen, setModalOpen] = useState<number>(0);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      setOpenAlertModal(true);
    }
  }, [userInfo]);

  const onClose = () => {
    setModalOpen(0);
    setRefetch(true);
  };

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
      </Container>
      <HourlyRateModal open={modalOpen === 1} onClose={onClose} />
      <AddPairModal open={modalOpen === 2} onClose={onClose} />
      <RemovePairModal open={modalOpen === 3} onClose={onClose} />
      <UpdatePairWeightModal open={modalOpen === 4} onClose={onClose} />
      <ChangeSignerModal open={modalOpen === 5} onClose={onClose} />
      <WithdrawalModal open={modalOpen === 6} onClose={onClose} />

      <Modal
        open={openAlertModal}
        onClose={() => {
          setOpenAlertModal(false);
          navigate('/');
        }}
      >
        <ModalBox>
          <Typography variant="h5" gutterBottom>
            You are not admin. You cant access this page.
          </Typography>
        </ModalBox>
      </Modal>
    </>
  );
};

export default Admin;
