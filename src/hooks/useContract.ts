import { RouterAddress } from '@/constants/network';
import { getContract } from '@/utils/contractHelper';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Abi, Address, formatEther, formatUnits, zeroAddress } from 'viem';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import ROUTER from '@/build/UniswapV2Router02.json';
import FACTORY from '@/build/IUniswapV2Factory.json';
import ERC20 from '@/build/ERC20.json';
import PAIR from '@/build/IUniswapV2Pair.json';
import { AbiType } from '@/types';
import { fetchReserves } from '@/utils/ethereumInfoFuntion';
type UseContractOptions = {
  chainId?: number;
};

export function useContract<TAbi extends Abi>(
  addressOrAddressMap?: Address | { [chainId: number]: Address },
  abi?: TAbi,
  options?: UseContractOptions,
) {
  const currentChainId = useChainId();
  const chainId = options?.chainId || currentChainId;
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null;
    let address: Address | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      return getContract({
        abi,
        address,
        chainId,
        signer: walletClient ?? undefined,
      });
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [addressOrAddressMap, abi, chainId, walletClient]);
}

export const useRouterContract = () => {
  return useContract(RouterAddress, (ROUTER as AbiType)?.abi);
};

export const useGetFactory = (address: Address) => {
  return useContract(address, (FACTORY as AbiType).abi);
};

export const useERC20 = (address: Address) => {
  return useContract(address, (ERC20 as AbiType).abi);
};

export const usePair = (address: Address) => {
  return useContract(address, (PAIR as AbiType).abi);
};

export const useGetReserves = (
  address1: Address,
  address2: Address,
  factory: ReturnType<typeof useGetFactory>,
) => {
  const { address } = useAccount();
  const [pairAddress, setPairAddress] = useState<Address>(zeroAddress);
  const pair = usePair(pairAddress);
  const ERC20_1 = useERC20(address1);
  const ERC20_2 = useERC20(address2);
  const [reseves, setReserves] = useState<string[]>([]);

  const fetchPairAddress = useCallback(async () => {
    try {
      const pairAddress = (await factory?.read?.getPair([
        address1,
        address2,
      ])) as Address;

      if (pairAddress !== '0x0000000000000000000000000000000000000000') {
        const reservesRaw = await fetchReserves(
          address1,
          address2,
          ERC20_1,
          ERC20_2,
          pair,
        );

        const liquidityTokens_BN = (await pair?.read?.balanceOf([
          address,
        ])) as bigint;
        const liquidityTokens = formatEther(liquidityTokens_BN);
        const res = [
          reservesRaw[0],
          reservesRaw[1],
          liquidityTokens,
        ] as string[];
        setReserves(res);
      } else {
        console.log('no reserves yet');
        setReserves(['0', '0', '0']);
      }
    } catch (err) {
      console.log(err);
    }
  }, [factory, address1, address2, ERC20_1, ERC20_2, pair, address]);

  useEffect(() => {
    if (factory) {
      fetchPairAddress();
    }
  }, [factory, fetchPairAddress]);
};
