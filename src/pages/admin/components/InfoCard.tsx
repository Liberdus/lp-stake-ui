import { useContract } from '@/providers/ContractProvider';
import { rewardTokenAtom } from '@/store/rewardToken';
import { SCPairData } from '@/types';
import { Card, CardContent, Stack, Grid, Typography, Divider, Box, Chip, CircularProgress } from '@mui/material';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GroupIcon from '@mui/icons-material/Group';
import { refetchAtom } from '@/store/refetch';

function InfoCard() {
  const { contract, rewardTokenContract, getPairs, getSigners, getHourlyRewardRate } = useContract();
  const [rewardBalance, setRewardBalance] = useState<string>('0');
  const [pairs, setPairs] = useState<SCPairData[]>([]);
  const [signers, setSigners] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>('0');
  const [rewardToken] = useAtom(rewardTokenAtom);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refetch, setRefetch] = useAtom(refetchAtom);

  const fetchContractInfo = async () => {
    if (contract && rewardTokenContract) {
      setIsLoading(true);
      try {
        const balance = await rewardTokenContract.balanceOf(await contract.getAddress());
        const pairs = await getPairs();
        const signers = await getSigners();
        const hourlyRate = await getHourlyRewardRate();
        setPairs(pairs);
        setSigners(signers);
        setHourlyRate(hourlyRate.toString());
        setRewardBalance(ethers.formatEther(balance));
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContractInfo();
  }, [contract, rewardTokenContract]);

  useEffect(() => {
    if (refetch) {
      fetchContractInfo();
      setRefetch(false);
    }
  }, [refetch]);

  return (
    <Grid item xs={12} md={9}>
      <Stack spacing={3}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Contract Information
            </Typography>

            {isLoading ? (
              <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceWalletIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Reward Token Balance
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {Number(rewardBalance).toFixed(2)} {rewardToken.symbol}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Hourly Distribution Rate
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {ethers.formatEther(hourlyRate)} {rewardToken.symbol}/hour
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SwapHorizIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Eligible Pairs
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {pairs.map((pair, index) => (
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 'medium' }}>{pair.pairName}</Typography>
                            <Chip label={`Weight: ${Number(ethers.formatEther(pair.weight)).toFixed(2)}`} color="primary" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {pair.lpToken}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GroupIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Current Signers
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {signers.map((signer, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography sx={{ fontFamily: 'monospace' }}>{signer}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Grid>
  );
}

export default InfoCard;
