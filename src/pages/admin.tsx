import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { userInfoAtom } from '@/store/userInfo';
import { useNavigate } from 'react-router-dom';
import { useContract } from '@/providers/ContractProvider';
import { Container, Typography, Box, Paper, TextField, Button, Grid, Card, CardContent, CardActions, Alert, Divider } from '@mui/material';
import useNotification from '@/hooks/useNotification';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [newDailyRate, setNewDailyRate] = useState<string>('0');
  const [newPairAddress, setNewPairAddress] = useState<string>('');
  const [newPairName, setNewPairName] = useState<string>('');
  const [newPairPlatform, setNewPairPlatform] = useState<string>('');
  const [newPairWeight, setNewPairWeight] = useState<string>('0');
  const [actionId, setActionId] = useState<string>('');
  const [actionCounter, setActionCounter] = useState<bigint>();
  const [requiredApprovals, setRequiredApprovals] = useState<bigint>();
  const [actionDetails, setActionDetails] = useState<any>();
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);

  // New states for update weights
  const [updatePairAddresses, setUpdatePairAddresses] = useState<string[]>(['']);
  const [updatePairWeights, setUpdatePairWeights] = useState<string[]>(['0']);

  const { contract, proposeSetDailyRewardRate, proposeAddPair, proposeUpdatePairWeights, approveAction, executeAction } = useContract();
  const [maxWeight, setMaxWeight] = useState<number>();

  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadContractData() {
      if (contract) {
        const counter = await contract.actionCounter();
        const approvals = await contract.REQUIRED_APPROVALS();
        const maxWeight = await contract.MAX_WEIGHT();

        setActionCounter(counter);
        setRequiredApprovals(approvals);
        setMaxWeight(maxWeight);
      }
    }
    loadContractData();
  }, [contract]);

  useEffect(() => {
    async function loadActionDetails() {
      if (contract && actionId) {
        const details = await contract.actions(BigInt(actionId));
        setActionDetails(details);
      }
    }
    loadActionDetails();
  }, [contract, actionId]);

  useEffect(() => {
    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [userInfo.isAdmin, navigate]);

  if (!userInfo.isAdmin) {
    return null;
  }

  const handleProposeDailyRate = async () => {
    if (newDailyRate !== '0') {
      try {
        await proposeSetDailyRewardRate(newDailyRate);
      } catch (error) {
        console.error('Error proposing daily rate:', error);
      }
    }
  };

  const handleProposeAddPair = async () => {
    if (newPairAddress && newPairPlatform && newPairName && newPairWeight !== '0') {
      try {
        console.log(maxWeight);

        if (maxWeight && ethers.parseEther(newPairWeight) > maxWeight) {
          alert(`Weight cannot be greater than ${ethers.formatEther(maxWeight)}`);
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
  };

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
  };

  const handleApproveAction = async () => {
    if (actionId) {
      try {
        await approveAction(Number(actionId));
      } catch (error: any) {
        showNotification('error', error?.data?.data?.message || 'Error approving action');
        console.error('Error approving action:', error);
      }
    }
  };

  const handleExecuteAction = async () => {
    if (actionId) {
      try {
        await executeAction(Number(actionId));
      } catch (error: any) {
        showNotification('error', error?.data?.data?.message || 'Error executing action');
        console.error('Error executing action:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        Admin Panel
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Set Daily Reward Rate
              </Typography>
              <TextField type="number" fullWidth value={newDailyRate} onChange={(e) => setNewDailyRate(e.target.value)} placeholder="New daily rate" margin="normal" />
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={handleProposeDailyRate} disabled={newDailyRate === '0'}>
                Propose New Rate
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12}>
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
        </Grid>

        <Grid item xs={12}>
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
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Multi-Sig Actions
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary">Total Actions: {actionCounter?.toString()}</Typography>
                <Typography color="text.secondary">Required Approvals: {requiredApprovals?.toString()}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField type="number" fullWidth value={actionId} onChange={(e) => setActionId(e.target.value)} placeholder="Action ID" margin="normal" />
                  {actionDetails && (
                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                      <Typography>Action Type: {actionDetails.actionType}</Typography>
                      <Typography>Approvals: {actionDetails.approvals?.toString()}</Typography>
                      <Typography>Executed: {actionDetails.executed ? 'Yes' : 'No'}</Typography>
                    </Paper>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleApproveAction} disabled={!actionId}>
                      Approve Action
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleExecuteAction}
                      disabled={!actionDetails || actionDetails.executed || actionDetails.approvals < (requiredApprovals || 0)}
                    >
                      Execute Action
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;
