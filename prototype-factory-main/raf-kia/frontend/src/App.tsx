import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { theme } from './theme';
import KiaAppMock from './pages/KiaAppMock';
import OnboardingFlow from './pages/OnboardingFlow';

type KiaScreen = 'home' | 'control' | 'ev-charging' | 'charging-settings' | 'scheduled-charging';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [kiaScreen, setKiaScreen] = useState<KiaScreen>('home');

  const handleLaunchOnboarding = (fromScreen: KiaScreen) => {
    setKiaScreen(fromScreen); // Remember which screen launched onboarding
    setShowOnboarding(true);
  };

  const handleReturnToApp = () => {
    setShowOnboarding(false);
    // KiaAppMock will use the kiaScreen state to show the correct screen
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 0, sm: 4 }
      }}>
        {showOnboarding ? (
          <OnboardingFlow onReturnToApp={handleReturnToApp} />
        ) : (
          <KiaAppMock 
            onLaunchOnboarding={handleLaunchOnboarding} 
            initialScreen={kiaScreen}
            onScreenChange={setKiaScreen}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
