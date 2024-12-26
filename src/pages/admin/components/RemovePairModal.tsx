import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Alert, Button, Card, CardActions, CardContent, Modal, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

interface RemovePairModalProps {
  open: boolean;
  onClose: () => void;
}

const RemovePairModal: React.FC<RemovePairModalProps> = ({ open, onClose }) => {
  const [removePairAddress, setRemovePairAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [availablePairs, setAvailablePairs] = useState<{address: string, pairName: string, platform: string, weight: string}[]>([]);
  const { proposeRemovePair, getPairs } = useContract();
  
  const validateInput = (): boolean => {
    if (!removePairAddress) {
      setError('Please select an LP token');
      return false;
    }
    if (!ethers.isAddress(removePairAddress)) {
      setError('Invalid LP token address format');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeRemovePair = async () => {
    if (!validateInput()) return;

    try {
      await proposeRemovePair(removePairAddress);
      onClose();
    } catch (err) {
      setError('Failed to propose pair removal. Please try again.');
    }
  };

  useEffect(() => {
    async function loadContractData() {
      const pairs = await getPairs();
      const pairsWithWeights = pairs.map((pair) => ({ address: pair.lpToken, pairName: pair.pairName, platform: pair.platform, weight: pair.weight.toString() }));
      setAvailablePairs(pairsWithWeights);
    }
    loadContractData();
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Remove Pair
            </Typography>

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <FormControl fullWidth>
                <InputLabel>Select LP Token</InputLabel>
                <Select
                  value={removePairAddress}
                  onChange={(e) => setRemovePairAddress(e.target.value)}
                  label="Select LP Token"
                >
                  {availablePairs?.map((pair) => (
                    <MenuItem key={pair.address} value={pair.address}>
                      {pair.pairName} ({pair.platform})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="error" onClick={handleProposeRemovePair} size="large" disabled={!removePairAddress}>
              Propose Remove Pair
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default RemovePairModal;
