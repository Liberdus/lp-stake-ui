import ModalBox from '@/components/ModalBox';
import useNotification from '@/hooks/useNotification';
import { useContract } from '@/providers/ContractProvider';
import { Button, Card, CardActions, CardContent, Modal, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

interface AddPairModalProps {
  open: boolean;
  onClose: () => void;
}

const AddPairModal: React.FC<AddPairModalProps> = ({ open, onClose }) => {
  const [newPairAddress, setNewPairAddress] = useState<string>('');
  const [newPairName, setNewPairName] = useState<string>('');
  const [newPairPlatform, setNewPairPlatform] = useState<string>('');
  const [newPairWeight, setNewPairWeight] = useState<string>('0');
  const [maxWeight, setMaxWeight] = useState<number>();

  const { proposeAddPair, getMaxWeight } = useContract();
  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadContractData() {
      const maxWeight = await getMaxWeight();
      setMaxWeight(Number(maxWeight));
    }
    loadContractData();
  }, []);

  const handleProposeAddPair = async () => {
    if (newPairAddress && newPairPlatform && newPairName && newPairWeight !== '0') {
      try {
        if (maxWeight && Number(newPairWeight) > maxWeight) {
          alert(`Weight cannot be greater than ${maxWeight}`);
          return;
        }

        if (!ethers.isAddress(newPairAddress)) {
          alert('Invalid LP token address format');
          return;
        }

        if (new TextEncoder().encode(newPairPlatform).length > 32) {
          alert('Platform name too long (max 32 bytes)');
          return;
        }

        await proposeAddPair(newPairAddress, newPairName, newPairPlatform, newPairWeight);
      } catch (error: any) {
        showNotification('error', error?.data?.data?.message || 'Error proposing new pair');
        console.error('Error proposing new pair:', error);
      }
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Add New Pair
            </Typography>
            <TextField fullWidth value={newPairAddress} onChange={(e) => setNewPairAddress(e.target.value)} placeholder="LP Token Address" margin="normal" />
            <TextField fullWidth value={newPairName} onChange={(e) => setNewPairName(e.target.value)} placeholder="LP Token Pair Name" margin="normal" />
            <TextField fullWidth value={newPairPlatform} onChange={(e) => setNewPairPlatform(e.target.value)} placeholder="Platform Name" margin="normal" />
            <TextField type="number" fullWidth value={newPairWeight} onChange={(e) => setNewPairWeight(e.target.value)} placeholder="Weight" margin="normal" />
          </CardContent>
          <CardActions>
            <Button fullWidth variant="contained" onClick={handleProposeAddPair} disabled={!newPairAddress || !newPairPlatform || newPairWeight === '0'}>
              Propose New Pair
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default AddPairModal;
