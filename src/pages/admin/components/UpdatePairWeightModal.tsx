import ModalBox from '@/components/ModalBox';
import useNotification from '@/hooks/useNotification';
import { useContract } from '@/providers/ContractProvider';
import { Box, Button, Card, CardActions, CardContent, Modal, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

interface UpdatePairWeightModalProps {
  open: boolean;
  onClose: () => void;
}

const UpdatePairWeightModal: React.FC<UpdatePairWeightModalProps> = ({ open, onClose }) => {
  // New states for update weights
  const [updatePairAddresses, setUpdatePairAddresses] = useState<string[]>(['']);
  const [updatePairWeights, setUpdatePairWeights] = useState<string[]>(['0']);
  const [maxWeight, setMaxWeight] = useState<number>();

  const { contract, proposeUpdatePairWeights } = useContract();
  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadContractData() {
      if (contract) {
        const maxWeight = await contract.MAX_WEIGHT();

        setMaxWeight(maxWeight);
      }
    }
    loadContractData();
  }, [contract]);

  const handleAddPairWeight = () => {
    setUpdatePairAddresses([...updatePairAddresses, '']);
    setUpdatePairWeights([...updatePairWeights, '0']);
  };

  const handleRemovePairWeight = (index: number) => {
    setUpdatePairAddresses(updatePairAddresses.filter((_, i) => i !== index));
    setUpdatePairWeights(updatePairWeights.filter((_, i) => i !== index));
  };

  const handleProposeUpdateWeights = async () => {
    try {
      // Validate addresses
      const validAddresses = updatePairAddresses.every((addr) => ethers.isAddress(addr));
      if (!validAddresses) {
        alert('Invalid LP token address format');
        return;
      }

      // Validate weights
      if (maxWeight) {
        const validWeights = updatePairWeights.every((weight) => Number(weight) <= Number(maxWeight) && Number(weight) >= 0);

        if (!validWeights) {
          alert(`Weights must be between 0 and ${maxWeight}`);
          return;
        }
      }

      await proposeUpdatePairWeights(updatePairAddresses, updatePairWeights);
    } catch (error: any) {
      showNotification('error', error?.data?.data?.message || 'Error proposing weight updates');
      console.error('Error proposing weight updates:', error);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Update Pair Weights
            </Typography>
            {updatePairAddresses.map((address, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  value={address}
                  onChange={(e) => {
                    const newAddresses = [...updatePairAddresses];
                    newAddresses[index] = e.target.value;
                    setUpdatePairAddresses(newAddresses);
                  }}
                  placeholder="LP Token Address"
                />
                <TextField
                  type="number"
                  sx={{ width: '200px' }}
                  value={updatePairWeights[index]}
                  onChange={(e) => {
                    const newWeights = [...updatePairWeights];
                    newWeights[index] = e.target.value;
                    setUpdatePairWeights(newWeights);
                  }}
                  placeholder="Weight"
                />
                <Button variant="outlined" color="error" onClick={() => handleRemovePairWeight(index)} disabled={updatePairAddresses.length === 1}>
                  Remove
                </Button>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleAddPairWeight}>
                Add Pair
              </Button>
              <Button variant="contained" onClick={handleProposeUpdateWeights} disabled={updatePairAddresses.some((addr) => !addr) || updatePairWeights.some((w) => w === '0')}>
                Propose Weight Updates
              </Button>
            </Box>
          </CardContent>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default UpdatePairWeightModal;
