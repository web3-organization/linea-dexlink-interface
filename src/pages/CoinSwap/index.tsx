import SwapPoolErros from '@/components/transactions/Switch/SwapPoolErros';
import SwitchAssetInput from '@/components/transactions/Switch/SwitchAssetInput';
import SwitchErrors from '@/components/transactions/Switch/SwitchErrors';
import { NetWorkType } from '@/components/Web3Provider';
import { COINLISTS } from '@/constants';
import { BalanceAndSymbol, CoinListTypes, TokenInfoTypes } from '@/types';
import {
  getAmountOut,
  getBalanceAndSymbol,
  getReserves,
} from '@/utils/ethereumInfoFuntion';
import { SwitchVerticalIcon } from '@heroicons/react/solid';
import {
  Box,
  Button,
  Divider,
  Grid2,
  IconButton,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Contract, ethers } from 'ethers';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
interface Props {
  network: NetWorkType;
}
const CoinSwap: React.FC<Props> = ({ network }) => {
  const currentChainId = useChainId();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [selectedInputToken, setSelectedInputToken] = useState<CoinListTypes>(
    network.coins[0],
  );
  const [selectedOutputToken, setSelectedOutputToken] = useState<CoinListTypes>(
    network.coins[3],
  );
  const [debounceInputAmount, setDebounceInputAmount] = useState('');

  // Stores the current reserves in the liquidity pool between selectedInputToken and selectedOutputToken
  const [reserves, setReserves] = useState<string[]>(['0.0', '0.0']);

  useEffect(() => {
    setTimeout(() => {
      handleGetInputBlanceAndSymbol(selectedInputToken.address);
      handleGetOutputBlanceAndSymbol(selectedOutputToken.address);
    }, 1000);
  }, []);

  useEffect(() => {
    console.log(
      'Trying to get Reserves between:\n' +
        selectedInputToken.address +
        '\n' +
        selectedOutputToken.address,
    );
    if (selectedInputToken.address && selectedOutputToken.address) {
      getReserves(
        selectedInputToken.address,
        selectedOutputToken.address,
        network.factory as Contract,
        network.signer as ethers.providers.JsonRpcSigner,
        network.account as Address,
      ).then((data) => setReserves(data));
    }
  }, [
    selectedInputToken.address,
    selectedOutputToken.address,
    network.account,
    network.factory,
    network.router,
    network.signer,
  ]);

  // caculate and set selectToken2 balance

  useEffect(() => {
    if (isNaN(parseFloat(debounceInputAmount))) {
      setOutputAmount('');
    } else if (
      parseFloat(debounceInputAmount) &&
      selectedInputToken.address &&
      selectedOutputToken.address
    ) {
      getAmountOut(
        selectedInputToken.address,
        selectedOutputToken.address,
        debounceInputAmount,
        network.router as Contract,
        network.signer as ethers.providers.JsonRpcSigner,
      )
        .then((amount) => {
          console.log('我看看总额', amount);
          setOutputAmount((amount as number).toFixed(7));
        })
        .catch(() => {
          setOutputAmount('0xNA');
        });
    } else {
      setOutputAmount('');
    }
  }, [
    debounceInputAmount,
    selectedInputToken.address,
    selectedOutputToken.address,
  ]);

  useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log("Checking balances...")

      if (selectedInputToken.address && selectedOutputToken.address && network.account) {
        getReserves(
          selectedInputToken.address,
          selectedOutputToken.address,
          network.factory,
          network.signer,
          network.account
        ).then((data) => setReserves(data))
      }

      if (selectedInputToken.address && network.account) {
        getBalanceAndSymbol(
          network.account,
          selectedInputToken.address,
          network.provider,
          network.signer,
          network.weth.address,
          network.coins
        ).then((data) => {
          setSelectedInputToken({
            ...selectedInputToken,
            balance: data.balance,
          })
        })
      }
      if (selectedOutputToken.address && network.account) {
        getBalanceAndSymbol(
          network.account,
          selectedOutputToken.address,
          network.provider,
          network.signer,
          network.weth.address,
          network.coins
        ).then((data) => {
          setSelectedOutputToken({
            ...selectedOutputToken,
            balance: data.balance,
          })
        })
      }
    }, 10000)

    return () => clearTimeout(coinTimeout)
  })

  // Turns the coin's reserves into something nice and readable
  const formatReserve = (reserve: string, symbol: string) => {
    if (reserve && symbol) return reserve + ' ' + symbol;
    else return '0.0';
  };

  const handleSelectedInputToken = (token: TokenInfoTypes) => {
    setSelectedInputToken(token);
    handleGetInputBlanceAndSymbol(token.address);
  };

  const handleSelectedOutputToken = (token: TokenInfoTypes) => {
    setSelectedOutputToken(token);
    handleGetOutputBlanceAndSymbol(token.address);
  };

  const handleInputChange = async (value: string) => {
    if (value === '-1') {
      setInputAmount(selectedInputToken?.balance as string);
      debouncedInputChange(value);
    } else {
      setInputAmount(value);
      debouncedInputChange(value);
    }
  };

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 300);
  }, [setDebounceInputAmount]);

  const handleGetInputBlanceAndSymbol = async (address: string | undefined) => {
    const balanceData: BalanceAndSymbol = await getBalanceAndSymbol(
      network.account,
      address,
      network.provider,
      network.signer,
      network.wethAddress,
      network.coins,
    );
    console.log(balanceData, '333');
    setSelectedInputToken((pre) => {
      return {
        ...pre,
        balance: balanceData?.balance,
      };
    });
  };

  const handleGetOutputBlanceAndSymbol = async (address: Address | string) => {
    const balanceData: BalanceAndSymbol = await getBalanceAndSymbol(
      network.account as Address,
      address,
      network.provider,
      network.signer,
      network.wethAddress,
      network.coins,
    );
    setSelectedOutputToken((pre) => {
      return {
        ...pre,
        balance: balanceData?.balance,
      };
    });
  };

  // switch reverse
  const onSwitchReserves = () => {
    const fromToken = selectedInputToken;
    const toToken = selectedOutputToken;
    setInputAmount(outputAmount);
    setDebounceInputAmount(outputAmount);
    setSelectedInputToken(toToken);
    setSelectedOutputToken(fromToken);
    setReserves(reserves.reverse());
  };

  return (
    <>
      <Box
        sx={(theme) => ({
          paddingTop: theme.spacing(12),
          display: 'flex', // 启用弹性布局
          justifyContent: 'center', // 水平居中
          alignItems: 'center', // 垂直居中
        })}
      >
        <Paper
          sx={(theme) => ({
            // maxWidth: '380px',
            padding: theme.spacing(6),
            maxWidth: { xs: '359px', xsm: '420px' },
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'auto',
            width: '100%',
          })}
        >
          <Typography variant="h2" sx={{ mb: 6 }}>
            Switch tokens
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: '15px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <SwitchAssetInput
              value={inputAmount}
              chainId={currentChainId}
              // loading={
              //   debounceInputAmount !== '0' && debounceInputAmount !== ''
              // }
              selectedAsset={selectedInputToken}
              assets={COINLISTS?.filter(
                (token) => token.address !== selectedOutputToken.address,
              )}
              onSelect={handleSelectedInputToken}
              onChange={handleInputChange}
            />
            <IconButton
              onClick={onSwitchReserves}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                position: 'absolute',
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'background.surface' },
              }}
            >
              <SvgIcon
                sx={{
                  color: 'primary.main',
                  fontSize: '18px',
                }}
              >
                <SwitchVerticalIcon />
              </SvgIcon>
            </IconButton>
            <SwitchAssetInput
              value={outputAmount}
              chainId={currentChainId}
              selectedAsset={selectedOutputToken}
              disableInput={true}
              assets={COINLISTS?.filter(
                (token) => token.address !== selectedInputToken.address,
              )}
              onSelect={handleSelectedOutputToken}
            />
          </Box>

          <Box>
            {/* <Divider sx={{ mt: 4 }} /> */}
            <Box
              sx={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <Typography variant="h3" sx={{ mt: 6 }}>
                Reserves
              </Typography>
            </Box>
            <Grid2 container direction="row" sx={{ textAlign: 'center' }}>
              <Grid2 size={6}>
                {formatReserve(reserves[0], selectedInputToken.symbol)}
              </Grid2>
              <Grid2 size={6}>
                {formatReserve(reserves[1], selectedOutputToken.symbol)}
              </Grid2>
            </Grid2>
          </Box>
          <Divider sx={{ mt: 4 }} />
          <SwitchErrors
            balance={selectedInputToken?.balance as string}
            inputAmount={inputAmount}
          />
          <Box
            sx={{
              marginTop: '48px',
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'center',
            }}
          >
            <Button variant="contained" sx={{ width: '100%' }}>
              Switch
            </Button>
          </Box>

          {/* <SwapPoolErros / */}
        </Paper>
      </Box>
    </>
  );
};

export default CoinSwap;
