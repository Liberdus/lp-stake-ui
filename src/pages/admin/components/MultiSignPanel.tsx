import { useContract } from '@/providers/ContractProvider';
import { Action } from '@/types';
import { truncateAddress } from '@/utils';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Tooltip,
} from '@mui/material';
import { ethers } from 'ethers';
import { Fragment, useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useAtom } from 'jotai';
import { refetchAtom } from '@/store/refetch';
import RefreshButton from '@/components/RefreshButton';
import BlockIcon from '@mui/icons-material/Block';

const ACTION_TYPE = ['SET_HOURLY_REWARD_RATE', 'UPDATE_PAIR_WEIGHTS', 'ADD_PAIR', 'REMOVE_PAIR', 'CHANGE_SIGNER', 'WITHDRAW_REWARDS'];

interface MultiSignPanelProps {}

const MultiSignPanel: React.FC<MultiSignPanelProps> = () => {
  const [actionCounter, setActionCounter] = useState<number>();
  const [requiredApprovals, setRequiredApprovals] = useState<number>();
  const [proposals, setProposals] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [hideExecuted, setHideExecuted] = useState<boolean>(true);
  const [refetch, setRefetch] = useAtom(refetchAtom);
  const { contract, approveAction, executeAction, rejectAction, getActionCounter, getRequiredApprovals, getActions, getActionPairs, getActionWeights, getPairInfo } = useContract();
  const [names, setNames] = useState<{ [key: string]: string }>({});

  async function loadContractData() {
    setIsLoading(true);
    try {
      const counter = Number(await getActionCounter());
      const approvals = await getRequiredApprovals();
      let tmpProposals: Action[] = [];
      for (let i = counter; i > Math.max(counter - 100, 0); i--) {
        const proposal = await getActions(i);
        const pairs = await getActionPairs(i);
        const weights = await getActionWeights(i);

        const pairsToFetch = new Set<string>();
        if (proposal.pairToRemove && proposal.pairToRemove !== ethers.ZeroAddress) {
          pairsToFetch.add(proposal.pairToRemove);
        }
        if (pairs.length > 0) {
          pairs.forEach((pair) => {
            if (pair !== ethers.ZeroAddress) {
              pairsToFetch.add(pair);
            }
          });
        }

        const pairInfos = await Promise.all(Array.from(pairsToFetch).map((pair) => getPairInfo(pair)));

        setNames((prevNames) => ({
          ...prevNames,
          ...Object.fromEntries(Array.from(pairsToFetch).map((pair, i) => [pair, pairInfos[i].pairName])),
        }));

        tmpProposals.push({
          id: i,
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
          rejected: proposal.rejected,
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
    if (refetch) {
      loadContractData();
      setRefetch(false);
    }
  }, [refetch]);

  const handleApproveAction = async (id: number) => {
    await approveAction(id);
    setRefetch(true);
  };

  const handleExecuteAction = async (id: number) => {
    await executeAction(id);
    setRefetch(true);
  };

  const handleRejectAction = async (id: number) => {
    await rejectAction(id);
    setRefetch(true);
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

  const filteredProposals = hideExecuted ? proposals.filter((p) => !p.executed && !p.rejected) : proposals;

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Proposals Panel
          </Typography>
          <RefreshButton onClick={() => setRefetch(true)} loading={isLoading} />
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
          <FormControlLabel control={<Checkbox checked={hideExecuted} onChange={(e) => setHideExecuted(e.target.checked)} color="primary" />} label="Hide executed transactions" />
          <Box>
            <Chip label={`Total Proposals: ${actionCounter?.toString() || 0}`} color="primary" variant="outlined" sx={{ mr: 1 }} />
            <Chip label={`Required Approvals: ${requiredApprovals?.toString() || 0}`} color="secondary" variant="outlined" />
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredProposals.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" color="text.secondary">
              No proposals available.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Approvals</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProposals.map((proposal) => {
                  const actionId = proposal.id;
                  const isExecuted = proposal.executed;
                  const canExecute = !isExecuted && requiredApprovals && proposal.approvals && proposal.approvals >= requiredApprovals;
                  const isExpanded = expandedRows.has(actionId);

                  return (
                    <Fragment key={actionId}>
                      <TableRow
                        sx={{
                          '&:hover': { bgcolor: 'action.hover' },
                          bgcolor: isExpanded ? 'action.selected' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleRow(actionId)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip label={actionId} size="small" />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip label={ACTION_TYPE[proposal.actionType]} color="primary" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip label={`${proposal.approvals?.toString() || 0} / ${requiredApprovals?.toString() || 0}`} color={canExecute ? 'success' : 'default'} size="small" />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isExecuted ? (
                            <Chip icon={<CheckCircleIcon />} label="Executed" color="success" size="small" />
                          ) : proposal.rejected ? (
                            <Chip icon={<BlockIcon />} label="Rejected" color="error" size="small" />
                          ) : (
                            <Chip icon={<CancelIcon />} label="Pending" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {!isExecuted && !proposal.rejected && (
                              <>
                                <Tooltip title="Approve Action">
                                  <IconButton color="primary" onClick={() => handleApproveAction(actionId)} size="small">
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Action">
                                  <IconButton color="error" onClick={() => handleRejectAction(actionId)} size="small">
                                    <BlockIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={canExecute ? 'Execute Action' : 'Needs more approvals'}>
                                  <span>
                                    <IconButton color="secondary" onClick={() => handleExecuteAction(actionId)} disabled={!canExecute} size="small">
                                      <PlayCircleIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 3, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Details:
                              </Typography>
                              <Grid container spacing={2}>
                                {proposal.newHourlyRewardRate && proposal.newHourlyRewardRate !== 0n ? (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>New Hourly Reward Rate:</strong> {ethers.formatEther(proposal?.newHourlyRewardRate)}
                                    </Typography>
                                  </Grid>
                                ) : null}
                                {ethers.ZeroAddress !== proposal.pairToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>{proposal.actionType.toString() !== '4' ? 'Pair to Add: ' : 'Original Signer: '}</strong>
                                      {truncateAddress(proposal.pairToAdd)}
                                    </Typography>
                                  </Grid>
                                )}
                                {ethers.ZeroAddress !== proposal.pairToRemove && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>{proposal.actionType.toString() !== '4' ? 'Pair to Remove: ' : 'New Signer: '}</strong>
                                      {truncateAddress(proposal.pairToRemove)} {names[proposal.pairToRemove]} {proposal.actionType === 3 ? proposal.pairNameToAdd : ''}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.pairNameToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Pair Name:</strong> {proposal.pairNameToAdd}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.platformToAdd && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Platform:</strong> {proposal.platformToAdd}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.weightToAdd !== 0n && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Weight:</strong> {ethers.formatEther(proposal.weightToAdd.toString())}
                                    </Typography>
                                  </Grid>
                                )}
                                {ethers.ZeroAddress !== proposal.recipient && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Recipient:</strong> {truncateAddress(proposal.recipient)}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.withdrawAmount !== 0n && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2">
                                      <strong>Withdraw Amount:</strong> {ethers.formatEther(proposal.withdrawAmount.toString())}
                                    </Typography>
                                  </Grid>
                                )}
                                {proposal.pairs?.length > 0 && proposal.actionType !== 1 && (
                                  <Grid item xs={12}>
                                    <Box component="pre" sx={{ mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                      {proposal.pairs.map((pair, idx) => `${pair}\t${names[pair]}\t${proposal.weights?.[idx] ? ethers.formatEther(proposal.weights[idx].toString()) : ''}\n`).join('')}
                                    </Box>
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
