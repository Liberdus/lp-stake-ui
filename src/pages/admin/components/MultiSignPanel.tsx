import { useContract } from '@/providers/ContractProvider';
import { Action } from '@/types';
import { truncateAddress } from '@/utils';
import { Box, Card, CardContent, CircularProgress, Collapse, Divider, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { Fragment, useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useAtom } from 'jotai';
import { refetchAtom } from '@/store/refetch';

const ACTION_TYPE = ['SET_HOURLY_REWARD_RATE', 'UPDATE_PAIR_WEIGHTS', 'ADD_PAIR', 'REMOVE_PAIR', 'CHANGE_SIGNER', 'WITHDRAW_REWARDS'];

interface MultiSignPanelProps {}

const MultiSignPanel: React.FC<MultiSignPanelProps> = () => {
  const [actionCounter, setActionCounter] = useState<number>();
  const [requiredApprovals, setRequiredApprovals] = useState<number>();
  const [proposals, setProposals] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [refetch, setRefetch] = useAtom(refetchAtom);
  const { contract, approveAction, executeAction, getActionCounter, getRequiredApprovals, getActions, getActionPairs, getActionWeights } = useContract();

  async function loadContractData() {
    setIsLoading(true);
    try {
      const counter = await getActionCounter();
      const approvals = await getRequiredApprovals();
      let tmpProposals: Action[] = [];
      for (let i = 1; i <= counter; i++) {
        const proposal = await getActions(i);
        const pairs = await getActionPairs(i);
        const weights = await getActionWeights(i);
        tmpProposals.push({
          actionType: proposal.actionType,
          newHourlyRewardRate: proposal.newHourlyRewardRate,
          pairs: pairs.map((pair) => pair.toString()),
          weights: weights.map((weight) => BigInt(weight)),
          pairToAdd: proposal.pairToAdd,
          pairNameToAdd: proposal.pairNameToAdd,
          platformToAdd: proposal.platformToAdd,
          weightToAdd: proposal.weightToAdd,
          pairToRemove: proposal.pairToRemove,
          recipient: proposal.recipient,
          withdrawAmount: proposal.withdrawAmount,
          executed: proposal.executed,
          expired: proposal.expired,
          approvals: proposal.approvals,
          approvedBy: proposal.approvedBy,
          proposedTime: proposal.proposedTime,
        });
      }
      setProposals(tmpProposals);
      setActionCounter(counter);
      setRequiredApprovals(approvals);
    } catch (error) {
    } finally {
      setIsLoading(false);
      setRefetch(false);
    }
  }

  useEffect(() => {
    loadContractData();
  }, [contract]);

  useEffect(() => {
    if (refetch) loadContractData();
  }, [refetch]);

  const handleApproveAction = async (id: number) => {
    await approveAction(id);
    const updatedProposal = await getActions(id);
    setProposals((prev) => prev.map((p, idx) => (idx + 1 === id ? updatedProposal : p)));
  };

  const handleExecuteAction = async (id: number) => {
    await executeAction(id);
    // Refresh proposals after action
    const updatedProposal = await getActions(id);
    setProposals((prev) => prev.map((p, idx) => (idx + 1 === id ? updatedProposal : p)));
  };

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Proposals Panel
        </Typography>

        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Typography sx={{ display: 'inline-block', mx: 1 }} color="text.secondary">
            Total Proposals: {actionCounter?.toString() || 0}
          </Typography>
          <Typography sx={{ display: 'inline-block', mx: 1 }} color="text.secondary">
            Required Approvals: {requiredApprovals?.toString() || 0}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : proposals.length === 0 ? (
          <Typography>No proposals available.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ textAlign: 'center' }}>ID</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Action Type</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Approvals</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Executed</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposals.map((proposal, index) => {
                  const actionId = index + 1;
                  const isExecuted = proposal.executed;
                  const canExecute = !isExecuted && requiredApprovals && proposal.approvals && proposal.approvals >= requiredApprovals;
                  const isExpanded = expandedRows.has(actionId);

                  return (
                    <Fragment key={actionId}>
                      <TableRow>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleRow(actionId)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{actionId}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{ACTION_TYPE[proposal.actionType]}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{proposal.approvals?.toString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{isExecuted ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!isExecuted && (
                              <>
                                <IconButton color="primary" onClick={() => handleApproveAction(actionId)}>
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => handleExecuteAction(actionId)} disabled={!canExecute}>
                                  <PlayCircleIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Details:
                              </Typography>
                              <Grid container spacing={1}>
                                {proposal?.newHourlyRewardRate !== 0n && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">New Hourly Reward Rate: {ethers.formatEther(proposal?.newHourlyRewardRate)}</Typography>
                                  </Grid>
                                )}
                                {ethers.ZeroAddress !== proposal.pairToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Pair to Add: {truncateAddress(proposal.pairToAdd)}</Typography>
                                  </Grid>
                                )}
                                {proposal.pairNameToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Pair Name: {proposal.pairNameToAdd}</Typography>
                                  </Grid>
                                )}
                                {proposal.platformToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Platform: {proposal.platformToAdd}</Typography>
                                  </Grid>
                                )}
                                {proposal.weightToAdd !== 0n && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Weight: {ethers.formatEther(proposal.weightToAdd.toString())}</Typography>
                                  </Grid>
                                )}
                                {ethers.ZeroAddress !== proposal.pairToRemove && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Pair to Remove: {truncateAddress(proposal.pairToRemove)}</Typography>
                                  </Grid>
                                )}
                                {ethers.ZeroAddress !== proposal.recipient && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Recipient: {truncateAddress(proposal.recipient)}</Typography>
                                  </Grid>
                                )}
                                {proposal.withdrawAmount !== 0n && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Withdraw Amount: {ethers.formatEther(proposal.withdrawAmount.toString())}</Typography>
                                  </Grid>
                                )}
                                {proposal.pairs.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Pairs: {proposal.pairs.map((pair) => truncateAddress(pair)).join(', ')}</Typography>
                                  </Grid>
                                )}
                                {proposal.weights.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">Weights: {proposal.weights.map((weight) => ethers.formatEther(weight.toString())).join(', ')}</Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiSignPanel;
