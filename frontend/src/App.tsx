import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import DailyAssistant from './pages/DailyAssistant';
import Settings from './pages/Settings';
import EnergyInsights from './pages/EnergyInsights';

function App() {
  return (
    <Router>
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="min-h-screen bg-gray-50">
        <main id="main-content" role="main">
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/daily-assistant" element={<DailyAssistant />} />
            <Route path="/insights" element={<EnergyInsights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
