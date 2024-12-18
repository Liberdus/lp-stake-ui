import { RouterProvider } from 'react-router-dom';
import router from './router';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './configs/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { ContractProvider } from './providers/ContractProvider';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAtom } from 'jotai';
import { colorModeAtom } from './store/colorMode';
import { AuthProvider } from './providers/AuthProvider';

const client = new QueryClient();

const App: React.FC = () => {
  const [colorMode] = useAtom(colorModeAtom);

  const theme = createTheme({
    palette: {
      mode: colorMode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Exo", "Helvetica", "Arial", sans-serif',
      fontSize: 15,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider theme={colorMode === 'light' ? lightTheme() : darkTheme()}>
            <ContractProvider>
              <AuthProvider>
                <RouterProvider router={router} />
              </AuthProvider>
            </ContractProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
