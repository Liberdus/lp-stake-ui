import { ModalBox } from '@/components/ModalBox';
import useNotification from '@/hooks/useNotification';
import { useContract } from '@/providers/ContractProvider';
import { Button, Card, CardActions, CardContent, Modal, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';

interface RemovePairModalProps {
  open: boolean;
  onClose: () => void;
}

const RemovePairModal: React.FC<RemovePairModalProps> = ({ open, onClose }) => {
  const [removePairAddress, setRemovePairAddress] = useState<string>('');
  const { contract, proposeRemovePair } = useContract();
  const { showNotification } = useNotification();

  const handleProposeRemovePair = async () => {
    if (removePairAddress) {
      try {
        if (!ethers.isAddress(removePairAddress)) {
          alert('Invalid LP token address format');
          return;
        }

        await proposeRemovePair(removePairAddress);
      } catch (error: any) {
        showNotification('error', error?.data?.data?.message || 'Error proposing pair removal');
        console.error('Error proposing pair removal:', error);
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
              Remove Pair
            </Typography>
            <TextField fullWidth value={removePairAddress} onChange={(e) => setRemovePairAddress(e.target.value)} placeholder="LP Token Address to Remove" margin="normal" />
          </CardContent>
          <CardActions>
            <Button fullWidth variant="contained" color="error" onClick={handleProposeRemovePair} disabled={!removePairAddress}>
              Propose Remove Pair
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default RemovePairModal;
