import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { muiTheme } from './theme';
import LandingPage from './pages/LandingPage';
import EmailCapture from './pages/EmailCapture';
import OnboardingFlow from './pages/OnboardingFlow';

const theme = createTheme(muiTheme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<EmailCapture />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
