import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Alert, Box, Button, Card, CardActions, CardContent, Modal, Stack, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

interface UpdatePairWeightModalProps {
  open: boolean;
  onClose: () => void;
}

const UpdatePairWeightModal: React.FC<UpdatePairWeightModalProps> = ({ open, onClose }) => {
  const [updatePairAddresses, setUpdatePairAddresses] = useState<string[]>(['']);
  const [updatePairWeights, setUpdatePairWeights] = useState<string[]>(['0']);
  const [maxWeight, setMaxWeight] = useState<number>();
  const [error, setError] = useState<string>('');

  const { proposeUpdatePairWeights, getMaxWeight } = useContract();

  useEffect(() => {
    async function loadContractData() {
      const maxWeight = await getMaxWeight();
      setMaxWeight(Number(maxWeight));
    }
    loadContractData();
  }, []);

  const handleAddPairWeight = () => {
    setUpdatePairAddresses([...updatePairAddresses, '']);
    setUpdatePairWeights([...updatePairWeights, '0']);
  };

  const handleRemovePairWeight = (index: number) => {
    setUpdatePairAddresses(updatePairAddresses.filter((_, i) => i !== index));
    setUpdatePairWeights(updatePairWeights.filter((_, i) => i !== index));
  };

  const handleProposeUpdateWeights = async () => {
    // Validate addresses
    const validAddresses = updatePairAddresses.every((addr) => ethers.isAddress(addr));
    if (!validAddresses) {
      setError('Invalid LP token address format');
      return;
    }

    // Validate weights
    if (maxWeight) {
      const validWeights = updatePairWeights.every((weight) => Number(weight) <= Number(maxWeight) && Number(weight) >= 0);

      if (!validWeights) {
        setError(`Weights must be between 0 and ${maxWeight}`);
        return;
      }
    }

    try {
      await proposeUpdatePairWeights(updatePairAddresses, updatePairWeights);
      onClose();
    } catch (err) {
      setError('Failed to propose weight updates. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 600 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Update Pair Weights
            </Typography>

            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              {updatePairAddresses.map((address, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="LP Token Address"
                    value={address}
                    onChange={(e) => {
                      const newAddresses = [...updatePairAddresses];
                      newAddresses[index] = e.target.value;
                      setUpdatePairAddresses(newAddresses);
                    }}
                    variant="outlined"
                    helperText="Enter the LP token address"
                  />
                  <TextField
                    type="number"
                    label="Weight"
                    sx={{ width: '200px' }}
                    value={updatePairWeights[index]}
                    onChange={(e) => {
                      const newWeights = [...updatePairWeights];
                      newWeights[index] = e.target.value;
                      setUpdatePairWeights(newWeights);
                    }}
                    variant="outlined"
                    helperText={`Max: ${maxWeight}`}
                    InputProps={{
                      inputProps: { min: 0, max: maxWeight, step: '0.000001' },
                    }}
                  />
                  <Button variant="outlined" color="error" onClick={() => handleRemovePairWeight(index)} disabled={updatePairAddresses.length === 1} sx={{ height: 56 }}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleAddPairWeight} startIcon={<span>+</span>}>
              Add Another Pair
            </Button>
            <Button
              variant="contained"
              onClick={handleProposeUpdateWeights}
              disabled={updatePairAddresses.some((addr) => !addr) || updatePairWeights.some((w) => w === '0')}
              color="warning"
              size="large"
            >
              Propose Weight Updates
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default UpdatePairWeightModal;
