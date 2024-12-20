import { Route, Routes } from 'react-router-dom';

import CoinSwap from './pages/CoinSwap';
import PageNotFount from './pages/404Page/404.page';
import Web3Provider from './components/Web3Provider';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import Index from './pages/Index';
import Liquidity from './pages/Liquidity';
import Home from './pages/index.page';

function App() {
  return (
    <>
      <SnackbarProvider maxSnack={3}>
        <Web3Provider
          render={(network) => (
            <React.Fragment>
              <Routes>
                <Route path="*" element={<PageNotFount />} />
                <Route path="/" element={<Home />} />
                {/* <Route path="/" element={<Navigate to="/swap" replace />} /> */}
                <Route path="/swap" element={<CoinSwap network={network} />} />
                <Route
                  path="/buy-index"
                  element={<Index network={network} />}
                />
                <Route
                  path="/liquidity"
                  element={<Liquidity network={network} />}
                />
              </Routes>
            </React.Fragment>
          )}
        ></Web3Provider>
      </SnackbarProvider>
    </>
  );
}

export default App;
