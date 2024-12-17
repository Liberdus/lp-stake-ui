import ModalBox from '@/components/ModalBox';
import useNotification from '@/hooks/useNotification';
import { useContract } from '@/providers/ContractProvider';
import { Button, Card, CardActions, CardContent, Modal, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';

interface ChangeSignerModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangeSignerModal: React.FC<ChangeSignerModalProps> = ({ open, onClose }) => {
  const [newSignerAddress, setNewSignerAddress] = useState<string>('');
  const [oldSignerAddress, setOldSignerAddress] = useState<string>('');

  const { contract, proposeChangeSigner } = useContract();
  const { showNotification } = useNotification();

  const handleProposeChangeSigner = async () => {
    if (oldSignerAddress && newSignerAddress) {
      if (!ethers.isAddress(newSignerAddress)) {
        alert('Invalid signer address format');
        return;
      }
      await proposeChangeSigner(oldSignerAddress, newSignerAddress);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Change Signer
            </Typography>
            <TextField fullWidth value={oldSignerAddress} onChange={(e) => setOldSignerAddress(e.target.value)} placeholder="Old Signer Address" margin="normal" />
            <TextField fullWidth value={newSignerAddress} onChange={(e) => setNewSignerAddress(e.target.value)} placeholder="New Signer Address" margin="normal" />
          </CardContent>
          <CardActions>
            <Button fullWidth variant="contained" color="warning" onClick={handleProposeChangeSigner} disabled={!newSignerAddress}>
              Propose Change Signer
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default ChangeSignerModal;
