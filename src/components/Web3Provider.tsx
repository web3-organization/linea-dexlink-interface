import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ContentContainer } from './ContentContainer';
import ConectWalletPaper from './ConectWalletPaper';
import { NetWorkList, routerAddress } from '@/constants/network';
import ChangeNetWorkPaper from './ChangeNetWorkPaper';
import { COINLISTS } from '@/constants';
import { Address, zeroAddress } from 'viem';
import { CoinListTypes } from '@/types';
import { Contract, ethers } from 'ethers';
import {
  getAccount,
  getFactory,
  getNetwork,
  getRouter,
  getWeth,
} from '@/utils/ethereumInfoFuntion';
import { useGetFactory, useGetRouterContract } from '@/hooks/useContract';
// interface Props {
//   render: (network: {
//     weth: unknown;
//     factory: unknown;
//     router: unknown;
//     coins: CoinListTypes[];
//   }) => ReactNode;
// }

interface Props {
  render: (network: {
    wethAddress: Address | string;
    coins: CoinListTypes[];
    factory: unknown
  }) => ReactNode
}
const Web3Provider:React.FC<Props> = (props) => {
  const { render } = props;
  const { isConnected, chainId } = useAccount();
  const routeContract = useGetRouterContract();
  // get weth address from router contract
  const [wethAddress, setWethAddress] = useState('');
  const [coinListsAllInfo, setCoinListsAllInfo] =
    useState<CoinListTypes[]>(COINLISTS);
  const [factoryAddress, setFactoryAddress] = useState<Address>(zeroAddress);
  const factoryContract = useGetFactory(factoryAddress)

  const getWethAddress = useCallback(async () => {
    if (routeContract) {
      const res = await routeContract?.read.WETH();
      setWethAddress(res as Address);
      setCoinListsAllInfo((prev) => {
        return prev.map((item) => {
          if (item.symbol === 'ETH') {
            return {
              ...item,
              address: res as Address,
            };
          }
          return item;
        });
      });
      const factory_address = await routeContract?.read.factory();
      setFactoryAddress(factory_address as Address)
    }
  }, [routeContract]);

  useEffect(() => {
    if (routeContract) {
      getWethAddress();
    }
  }, [routeContract, getWethAddress]);


  // const network = useRef({
  //   weth: null as unknown,
  //   factory: null as unknown,
  //   router: null as unknown,
  //   coins: [...COINLISTS],
  //   provider: null as ethers.providers.Web3Provider | null,
  //   signer: null as ethers.providers.JsonRpcSigner | null,
  //   account: null as Address | null,
  //   chainID: null as number | null,
  //   wethAddress: null as Address | null,
  // });
  // const backgroundListener = useRef(null as unknown);

  // const setupConnection = async () => {
  //   try {
  //     network.current.provider = new ethers.providers.Web3Provider(
  //       window.ethereum,
  //     );
  //     network.current.signer = await network.current.provider.getSigner();
  //     await getAccount().then(async (result) => {
  //       network.current.account = result;
  //     });

  //     await getNetwork(network.current.provider).then(async (chainId) => {
  //       network.current.chainID = chainId;
  //       if (NetWorkList.includes(chainId)) {
  //         network.current.router = await getRouter(
  //           routerAddress.get(chainId),
  //           network.current.signer as ethers.providers.JsonRpcSigner,
  //         );
  //         await (network.current.router as Contract)
  //           .WETH()
  //           .then((wethAddress: Address) => {
  //             network.current.wethAddress = wethAddress;
  //             network.current.weth = getWeth(
  //               wethAddress,
  //               network.current.signer as ethers.providers.JsonRpcSigner,
  //             );

  //             // Set the value of the weth address in the default coins array
  //             network.current.coins[2].address = wethAddress;
  //           });
  //         await (network.current.router as Contract)
  //           .factory()
  //           .then((factory_address: Address) => {
  //             network.current.factory = getFactory(
  //               factory_address,
  //               network.current.signer as ethers.providers.JsonRpcSigner,
  //             );
  //           });
  //       } else {
  //         console.log('Wrong network mate.');
  //       }
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const createListener = async () => {
  //   return setInterval(async () => {
  //     // console.log("Heartbeat");
  //     try {
  //       // Check the account has not changed
  //       const account = await getAccount();
  //       if (account != network.current.account) {
  //         await setupConnection();
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       await setupConnection();
  //     }
  //   }, 1000);
  // };

  // useEffect(() => {
  //   const initFunc = async () => {
  //     await setupConnection();
  //     if (backgroundListener.current != null) {
  //       clearInterval(backgroundListener.current);
  //     }
  //     const listener = createListener();
  //     backgroundListener.current = listener as Promise<unknown>;
  //     return () => clearInterval(backgroundListener.current);
  //   };
  //   initFunc();
  // }, []);

  return (
    <>
      {!isConnected && (
        <ContentContainer>
          <ConectWalletPaper />
        </ContentContainer>
      )}
      {isConnected && !NetWorkList.includes(chainId as number) && (
        <ContentContainer>
          <ChangeNetWorkPaper />
        </ContentContainer>
      )}
      {isConnected &&
        NetWorkList.includes(chainId as number) &&
        render({
          wethAddress,
          coins: coinListsAllInfo,
          factory: factoryContract
        })}
    </>
  );
};

export default Web3Provider;
