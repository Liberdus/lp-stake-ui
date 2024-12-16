import useNotification from '@/hooks/useNotification';
import { useContract } from '@/providers/ContractProvider';
import { Button } from '@mui/material';
import { Paper } from '@mui/material';
import { Box, CardContent, Divider, Grid, TextField, Typography } from '@mui/material';
import { Card } from '@mui/material';
import { useEffect, useState } from 'react';

interface MultiSignPanelProps {}

const MultiSignPanel: React.FC<MultiSignPanelProps> = () => {
  const [actionId, setActionId] = useState<string>('');
  const [actionCounter, setActionCounter] = useState<bigint>();
  const [requiredApprovals, setRequiredApprovals] = useState<bigint>();
  const [actionDetails, setActionDetails] = useState<any>();

  const { contract, approveAction, executeAction } = useContract();
  const { showNotification } = useNotification();

  useEffect(() => {
    async function loadContractData() {
      if (contract) {
        const counter = await contract.actionCounter();
        const approvals = await contract.REQUIRED_APPROVALS();

        setActionCounter(counter);
        setRequiredApprovals(approvals);
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
              <Button variant="contained" color="secondary" onClick={handleExecuteAction} disabled={!actionDetails || actionDetails.executed || actionDetails.approvals < (requiredApprovals || 0)}>
                Execute Action
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MultiSignPanel;
