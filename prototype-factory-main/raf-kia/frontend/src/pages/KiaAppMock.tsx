import { useState } from 'react';
import { Box, Typography, IconButton, Switch } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import SensorWindowOutlinedIcon from '@mui/icons-material/SensorWindowOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import EvStationIcon from '@mui/icons-material/EvStation';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import WifiIcon from '@mui/icons-material/Wifi';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import Battery60Icon from '@mui/icons-material/Battery60';

type KiaScreen = 'home' | 'control' | 'ev-charging' | 'charging-settings' | 'scheduled-charging';

interface KiaAppMockProps {
  onLaunchOnboarding: (fromScreen: KiaScreen) => void;
  initialScreen?: KiaScreen;
  onScreenChange?: (screen: KiaScreen) => void;
}

// Kia app exact colors from screenshots
const kia = {
  bg: '#0A0E12',
  bgCard: '#151A1F',
  bgCardLight: '#1C2127',
  accent: '#7FD858', // Kia green from screenshots
  accentDark: '#5CB82F',
  accentTeal: '#00D9B1',
  text: '#FFFFFF',
  textSecondary: '#8A9199',
  textMuted: '#5A6169',
  border: '#2A3038',
  tabActive: '#FFFFFF',
  tabInactive: '#5A6169',
};

// Kia EV6 top-down car image (silver/grey)
const KiaEV6TopView = () => (
  <svg width="120" height="220" viewBox="0 0 120 220" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Car body */}
    <ellipse cx="60" cy="110" rx="45" ry="95" fill="#3A3D42"/>
    {/* Roof */}
    <ellipse cx="60" cy="100" rx="32" ry="55" fill="#4A4D52"/>
    {/* Windshield */}
    <ellipse cx="60" cy="65" rx="25" ry="25" fill="#2A2D32"/>
    {/* Rear window */}
    <ellipse cx="60" cy="145" rx="22" ry="20" fill="#2A2D32"/>
    {/* Front lights */}
    <rect x="20" y="20" width="15" height="4" rx="2" fill="#E8E8E8"/>
    <rect x="85" y="20" width="15" height="4" rx="2" fill="#E8E8E8"/>
    {/* Rear lights */}
    <rect x="22" y="195" width="12" height="3" rx="1.5" fill="#FF4444"/>
    <rect x="86" y="195" width="12" height="3" rx="1.5" fill="#FF4444"/>
    {/* Side mirrors */}
    <ellipse cx="12" cy="70" rx="6" ry="4" fill="#3A3D42"/>
    <ellipse cx="108" cy="70" rx="6" ry="4" fill="#3A3D42"/>
    {/* Door handles */}
    <rect x="15" y="90" width="8" height="2" rx="1" fill="#5A5D62"/>
    <rect x="97" y="90" width="8" height="2" rx="1" fill="#5A5D62"/>
    {/* Center lock icon area */}
    <circle cx="60" cy="95" r="12" fill="#1C2127" stroke="#3A3D42" strokeWidth="1"/>
    <LockOutlinedIcon style={{ position: 'absolute', color: '#8A9199' }} />
  </svg>
);

function KiaAppMock({ onLaunchOnboarding, initialScreen = 'home', onScreenChange }: KiaAppMockProps) {
  const [currentScreen, setCurrentScreen] = useState<KiaScreen>(initialScreen);
  const [activeTab, setActiveTab] = useState<'control' | 'ev'>('control');
  const [scheduledChargingEnabled, setScheduledChargingEnabled] = useState(true);

  // Update parent when screen changes
  const changeScreen = (screen: KiaScreen) => {
    setCurrentScreen(screen);
    if (onScreenChange) {
      onScreenChange(screen);
    }
  };

  // Bottom Navigation Bar
  const BottomNav = ({ active }: { active: string }) => (
    <Box sx={{ 
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      py: 1.5, borderTop: `1px solid ${kia.border}`, backgroundColor: kia.bg
    }}>
      {[
        { id: 'home', icon: HomeOutlinedIcon, label: 'Home' },
        { id: 'map', icon: MapOutlinedIcon, label: 'Map' },
        { id: 'control', icon: DirectionsCarOutlinedIcon, label: 'Control' },
        { id: 'store', icon: StorefrontOutlinedIcon, label: 'Store' },
        { id: 'vehicle', icon: PersonOutlineIcon, label: 'Vehicle' },
      ].map(item => (
        <Box key={item.id} onClick={() => item.id === 'home' ? changeScreen('home') : item.id === 'control' ? changeScreen('control') : null}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 60 }}>
          <item.icon sx={{ color: active === item.id ? kia.tabActive : kia.tabInactive, fontSize: 24 }} />
          <Typography sx={{ fontSize: '0.65rem', fontFamily: 'Inter, sans-serif', color: active === item.id ? kia.tabActive : kia.tabInactive, mt: 0.5 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  // Status Bar (realistic)
  const StatusBar = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: kia.text, fontFamily: 'Inter, sans-serif' }}>11:50</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <BluetoothIcon sx={{ fontSize: 14, color: kia.text }} />
        <SignalCellularAltIcon sx={{ fontSize: 14, color: kia.text }} />
        <WifiIcon sx={{ fontSize: 14, color: kia.text }} />
        <Battery60Icon sx={{ fontSize: 16, color: kia.text }} />
        <Typography sx={{ fontSize: '0.75rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>77</Typography>
      </Box>
    </Box>
  );

  // Header with back button
  const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.5 }}>
      <IconButton onClick={onBack} sx={{ color: kia.text, p: 1 }}>
        <ChevronLeftIcon sx={{ fontSize: 28 }} />
      </IconButton>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: kia.text, flex: 1, textAlign: 'center', mr: 5, fontFamily: 'Inter, sans-serif' }}>
        {title}
      </Typography>
    </Box>
  );

  // HOME SCREEN - Vehicle Status
  const renderHome = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: kia.bg }}>
      <StatusBar />
      
      {/* Kia Logo & Header */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <img 
            src="/Kia-logo.png?v=2" 
            alt="Kia Logo" 
            style={{ 
              height: '28px', 
              width: 'auto',
              filter: 'brightness(0) invert(1)'
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NotificationsNoneIcon sx={{ fontSize: 24, color: kia.textSecondary }} />
            <AccountCircleOutlinedIcon sx={{ fontSize: 24, color: kia.textSecondary }} />
          </Box>
        </Box>
        
        {/* Weather & Greeting */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <WbSunnyOutlinedIcon sx={{ fontSize: 14, color: kia.accentTeal }} />
            <Typography sx={{ fontSize: '0.75rem', color: kia.accentTeal, fontFamily: 'Inter, sans-serif' }}>12.0°C · London</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Robin, let's get going.</Typography>
        </Box>
        
        {/* Search Bar */}
        <Box sx={{ 
          backgroundColor: kia.accentTeal, borderRadius: '25px', px: 2, py: 1.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Typography sx={{ fontSize: '0.875rem', color: kia.bg, fontFamily: 'Inter, sans-serif' }}>Enter location, address or vehicle.</Typography>
          <Typography sx={{ fontSize: '1rem', color: kia.bg }}>✕</Typography>
        </Box>
      </Box>

      {/* Vehicle Card */}
      <Box sx={{ flex: 1, px: 2 }}>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, color: kia.text, mb: 1, fontFamily: 'Inter, sans-serif' }}>EV6</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${kia.textSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeWorkOutlinedIcon sx={{ fontSize: 16, color: kia.textSecondary }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BoltIcon sx={{ color: kia.accent, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.875rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>38% (7.1kW)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EvStationIcon sx={{ fontSize: 16, color: kia.textSecondary }} />
            <Typography sx={{ fontSize: '0.875rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>120 mi</Typography>
          </Box>
        </Box>

        {/* Car Image - Kia EV6 */}
        <Box sx={{ 
          height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 2
        }}>
          <img 
            src="/kia-ev6-front.png" 
            alt="Kia EV6"
            style={{ height: '120px', objectFit: 'contain' }}
          />
        </Box>

        {/* Battery Progress */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ height: 6, backgroundColor: kia.bgCardLight, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ width: '38%', height: '100%', backgroundColor: kia.accent, borderRadius: 3 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Remaining time</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Approx. 9h</Typography>
        </Box>

        {/* Remote Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.875rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Remote control</Typography>
          <SettingsOutlinedIcon sx={{ fontSize: 16, color: kia.textSecondary }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[
            { icon: AcUnitIcon, label: 'Climate control', active: false },
            { icon: LockOutlinedIcon, label: 'Doors', active: false },
            { icon: BoltIcon, label: 'Charging', active: true },
            { icon: SensorWindowOutlinedIcon, label: 'Windows', active: false },
          ].map((item, i) => (
            <Box key={i} onClick={() => item.label === 'Charging' ? changeScreen('control') : null}
              sx={{ 
                flex: 1, backgroundColor: item.active ? kia.accentTeal : kia.bgCard, borderRadius: 2, p: 1.5,
                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'
              }}>
              <item.icon sx={{ color: item.active ? kia.bg : kia.textSecondary, fontSize: 24, mb: 0.5 }} />
              <Typography sx={{ fontSize: '0.6rem', color: item.active ? kia.bg : kia.textSecondary, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <BottomNav active="home" />
    </Box>
  );

  // CONTROL SCREEN - with Control/EV tabs
  const renderControl = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: kia.bg }}>
      <StatusBar />
      
      {/* Header */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Control</Typography>
          <IconButton sx={{ color: kia.textSecondary }}><SettingsOutlinedIcon /></IconButton>
        </Box>
        
        {/* Battery Status Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${kia.textSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeWorkOutlinedIcon sx={{ fontSize: 14, color: kia.textSecondary }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BoltIcon sx={{ color: kia.accent, fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.8rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>38% (1.7kW)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EvStationIcon sx={{ fontSize: 14, color: kia.textSecondary }} />
            <Typography sx={{ fontSize: '0.8rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>120 mi</Typography>
          </Box>
        </Box>

        {/* Service Notice */}
        <Box sx={{ backgroundColor: kia.bgCard, borderRadius: 2, px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>The service is restricted or not available.</Typography>
          <SettingsOutlinedIcon sx={{ fontSize: 18, color: kia.textSecondary }} />
        </Box>

        {/* Control / EV Tabs */}
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${kia.border}` }}>
          <Box onClick={() => setActiveTab('control')} sx={{ flex: 1, pb: 1.5, cursor: 'pointer', borderBottom: activeTab === 'control' ? `2px solid ${kia.text}` : 'none' }}>
            <Typography sx={{ fontSize: '0.9rem', color: activeTab === 'control' ? kia.text : kia.textSecondary, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Control</Typography>
          </Box>
          <Box onClick={() => setActiveTab('ev')} sx={{ flex: 1, pb: 1.5, cursor: 'pointer', borderBottom: activeTab === 'ev' ? `2px solid ${kia.text}` : 'none' }}>
            <Typography sx={{ fontSize: '0.9rem', color: activeTab === 'ev' ? kia.text : kia.textSecondary, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>EV</Typography>
          </Box>
        </Box>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, px: 2, pt: 2 }}>
        {activeTab === 'control' ? (
          // Control Tab - Vehicle visualization with top-down car image
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Top-down car image from public folder */}
              <img 
                src="/kia-ev6-top-view.png"
                alt="Kia EV6 Top View"
                style={{ 
                  width: '140px', 
                  height: 'auto',
                  opacity: 0.85,
                  transform: 'rotate(90deg)'
                }}
                onError={(e) => {
                  // Fallback to SVG if image fails
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('car-fallback');
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Fallback SVG if image doesn't load */}
              <Box sx={{ position: 'absolute', display: 'none', opacity: 0.85 }} id="car-fallback">
                <KiaEV6TopView />
              </Box>
              {/* Control icons around car */}
              <Box sx={{ position: 'absolute', top: 30, left: 30, width: 48, height: 48, borderRadius: 2, border: `1px solid ${kia.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kia.bgCard }}>
                <AcUnitIcon sx={{ fontSize: 24, color: kia.textSecondary }} />
              </Box>
              <Box sx={{ position: 'absolute', top: 30, right: 30, width: 48, height: 48, borderRadius: 2, border: `1px solid ${kia.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kia.bgCard }}>
                <SensorWindowOutlinedIcon sx={{ fontSize: 24, color: kia.textSecondary }} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 50, left: 30, width: 48, height: 48, borderRadius: 2, border: `1px solid ${kia.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kia.bgCard }}>
                <LockOutlinedIcon sx={{ fontSize: 24, color: kia.textSecondary }} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: 50, right: 30, width: 48, height: 48, borderRadius: 2, border: `1px solid ${kia.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: kia.bgCard }}>
                <SensorWindowOutlinedIcon sx={{ fontSize: 24, color: kia.textSecondary, transform: 'rotate(90deg)' }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, mt: 1, fontFamily: 'Inter, sans-serif' }}>
              Select a vehicle feature or warning icon to view detailed information about it.
            </Typography>
          </Box>
        ) : (
          // EV Tab - Charging info
          <Box>
            {/* Battery Circle */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '3.5rem', fontWeight: 300, color: kia.text, fontFamily: 'Inter, sans-serif' }}>38<span style={{ fontSize: '1.5rem' }}>%</span></Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <BoltIcon sx={{ color: kia.accent, fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.875rem', color: kia.accent, fontFamily: 'Inter, sans-serif' }}>AC charging (1.7kW)</Typography>
              </Box>
            </Box>

            {/* Battery Bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ height: 24, backgroundColor: kia.bgCardLight, borderRadius: 1, overflow: 'hidden', display: 'flex' }}>
                <Box sx={{ width: '38%', height: '100%', backgroundColor: kia.accent, borderRadius: 1 }} />
              </Box>
              <Typography sx={{ fontSize: '0.7rem', color: kia.textSecondary, textAlign: 'right', mt: 0.5, fontFamily: 'Inter, sans-serif' }}>100%</Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1, backgroundColor: kia.bgCard, borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PauseCircleOutlineIcon sx={{ color: kia.accent, fontSize: 28, mb: 1 }} />
                <Typography sx={{ fontSize: '0.75rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Stop charging</Typography>
              </Box>
              <Box sx={{ flex: 1, backgroundColor: kia.bgCard, borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BatteryChargingFullIcon sx={{ color: kia.textSecondary, fontSize: 28, mb: 1 }} />
                <Typography sx={{ fontSize: '0.75rem', color: kia.text, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>Start battery conditioning</Typography>
              </Box>
            </Box>

            {/* Scheduled Charging Link */}
            <Box onClick={() => changeScreen('charging-settings')}
              sx={{ backgroundColor: kia.bgCard, borderRadius: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Scheduled charging</Typography>
              <ChevronRightIcon sx={{ color: kia.textSecondary }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Quick Actions (only on Control tab) */}
      {activeTab === 'control' && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ backgroundColor: kia.accentTeal, borderRadius: 2, p: 1.5, minWidth: 100 }}>
              <BoltIcon sx={{ color: kia.bg, fontSize: 20 }} />
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: kia.bg, fontFamily: 'Inter, sans-serif' }}>38%</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: kia.bg, fontFamily: 'Inter, sans-serif' }}>AC charging (1.7kW)</Typography>
            </Box>
            <Box sx={{ backgroundColor: kia.bgCard, borderRadius: 2, p: 1.5, minWidth: 90 }}>
              <WbSunnyOutlinedIcon sx={{ fontSize: 20, color: '#FFB800' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Set to highest</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>High</Typography>
            </Box>
            <Box sx={{ backgroundColor: kia.bgCard, borderRadius: 2, p: 1.5, minWidth: 90 }}>
              <ThermostatIcon sx={{ fontSize: 20, color: kia.accent }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Smart clim...</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>26.0°C</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <BottomNav active="control" />
    </Box>
  );


  // CHARGING SETTINGS SCREEN
  const renderChargingSettings = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: kia.bg }}>
      <StatusBar />
      <Header title="Charging settings" onBack={() => { changeScreen('control'); setActiveTab('ev'); }} />
      
      <Box sx={{ flex: 1, px: 2 }}>
        {/* Scheduled Charging */}
        <Box onClick={() => changeScreen('scheduled-charging')}
          sx={{ py: 2, borderBottom: `1px solid ${kia.border}`, cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Scheduled charging</Typography>
            <ChevronRightIcon sx={{ color: kia.textSecondary }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ backgroundColor: kia.bgCard, borderRadius: 1, px: 1.5, py: 0.5 }}>
              <Typography sx={{ fontSize: '0.8rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>00:00 ~ 12:00</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: kia.textMuted, fontFamily: 'Inter, sans-serif' }}>Set time priority</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Off</Typography>
          </Box>
        </Box>

        {/* Target Charge Level */}
        <Box sx={{ py: 2, borderBottom: `1px solid ${kia.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Target charge level</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>DC 100% | AC 100%</Typography>
          </Box>
          <ChevronRightIcon sx={{ color: kia.textSecondary }} />
        </Box>

        {/* V2L Usage Limit */}
        <Box sx={{ py: 2, borderBottom: `1px solid ${kia.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>V2L usage limit</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>20%</Typography>
          </Box>
          <ChevronRightIcon sx={{ color: kia.textSecondary }} />
        </Box>

        {/* Notification */}
        <Box sx={{ py: 2, borderBottom: `1px solid ${kia.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Notification before end of charging</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Not set</Typography>
          </Box>
          <ChevronRightIcon sx={{ color: kia.textSecondary }} />
        </Box>

        {/* AC Charging Current */}
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '1rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>AC charging current</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>100%</Typography>
          </Box>
          <ChevronRightIcon sx={{ color: kia.textSecondary }} />
        </Box>
      </Box>
    </Box>
  );

  // SCHEDULED CHARGING SCREEN - with accurate clock view
  const renderScheduledCharging = () => {
    // Clock face component matching the Kia app screenshot - complete semi-circle
    const ClockFace = () => {
      const size = 260; // Increased to accommodate labels
      const center = size / 2;
      const radius = 90;
      const strokeWidth = 14;
      
      // Calculate arc for 00:00 to 12:00 (180 degrees semi-circle from top to bottom)
      const startAngle = -90; // 00:00 at top (12 o'clock position)
      const endAngle = 90; // 12:00 at bottom (6 o'clock position)
      
      const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
        const rad = (angle * Math.PI) / 180;
        return {
          x: cx + r * Math.cos(rad),
          y: cy + r * Math.sin(rad)
        };
      };
      
      const describeArc = (cx: number, cy: number, r: number, startAng: number, endAng: number) => {
        const start = polarToCartesian(cx, cy, r, endAng);
        const end = polarToCartesian(cx, cy, r, startAng);
        const largeArcFlag = endAng - startAng <= 180 ? 0 : 1;
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
      };
      
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background full circle (darker) */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke={kia.bgCardLight} strokeWidth={strokeWidth} />
          
          {/* Active arc (green semi-circle from 00:00 to 12:00) */}
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={kia.accent} />
              <stop offset="100%" stopColor={kia.accent} />
            </linearGradient>
          </defs>
          <path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            stroke={kia.accent}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Hour markers - only show 0, 6, 12, 18 */}
          {[0, 6, 12, 18].map((hour) => {
            const angle = (hour * 15) - 90; // 15 degrees per hour, offset by -90 to start at top
            const markerOuter = polarToCartesian(center, center, radius + 30, angle);
            return (
              <g key={hour}>
                <text
                  x={markerOuter.x}
                  y={markerOuter.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={kia.text}
                  fontSize="16"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                >
                  {hour}
                </text>
              </g>
            );
          })}
          
          {/* Start time indicator (00:00 - top) with bolt icon */}
          <circle
            cx={polarToCartesian(center, center, radius, startAngle).x}
            cy={polarToCartesian(center, center, radius, startAngle).y}
            r="16"
            fill={kia.accent}
            stroke={kia.bg}
            strokeWidth="2"
          />
          
          {/* End time indicator (12:00 - bottom) with bolt icon */}
          <circle
            cx={polarToCartesian(center, center, radius, endAngle).x}
            cy={polarToCartesian(center, center, radius, endAngle).y}
            r="16"
            fill={kia.accent}
            stroke={kia.bg}
            strokeWidth="2"
          />
          
          {/* Bolt icons at start and end */}
          <g transform={`translate(${polarToCartesian(center, center, radius, startAngle).x - 8}, ${polarToCartesian(center, center, radius, startAngle).y - 8})`}>
            <path d="M10 2L4 10h4l-2 6 6-8H8l2-6z" fill={kia.bg} />
          </g>
          <g transform={`translate(${polarToCartesian(center, center, radius, endAngle).x - 8}, ${polarToCartesian(center, center, radius, endAngle).y - 8})`}>
            <path d="M10 2L4 10h4l-2 6 6-8H8l2-6z" fill={kia.bg} />
          </g>
        </svg>
      );
    };

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: kia.bg }}>
        <StatusBar />
        <Header title="Scheduled charging" onBack={() => changeScreen('charging-settings')} />
        
        <Box sx={{ flex: 1, px: 2, overflow: 'auto' }}>
          {/* Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: kia.text, fontFamily: 'Inter, sans-serif' }}>Scheduled charging</Typography>
            <Switch 
              checked={scheduledChargingEnabled} 
              onChange={(e) => setScheduledChargingEnabled(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: kia.accent },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: kia.accent },
              }}
            />
          </Box>

          {/* Priority Options */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${kia.textSecondary}` }} />
              <Typography sx={{ fontSize: '0.9rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Set time priority</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${kia.accent}`, backgroundColor: kia.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: kia.bg }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9rem', color: kia.text, fontFamily: 'Inter, sans-serif' }}>Target charge priority</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>The AC target charge level can be changed in the settings.</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>100%</Typography>
            </Box>
          </Box>

          {/* Time Display */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ border: `1px solid ${kia.textSecondary}`, borderRadius: 2, px: 2, py: 0.5, mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Start time</Typography>
              </Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 300, color: kia.text, fontFamily: 'Inter, sans-serif' }}>00:00</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Today</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ border: `1px solid ${kia.accent}`, borderRadius: 2, px: 2, py: 0.5, mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', color: kia.accent, fontFamily: 'Inter, sans-serif' }}>End time</Typography>
              </Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 300, color: kia.text, fontFamily: 'Inter, sans-serif' }}>12:00</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: kia.textSecondary, fontFamily: 'Inter, sans-serif' }}>Today</Typography>
            </Box>
          </Box>

          {/* Circular Time Picker - accurate to screenshot */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ClockFace />
          </Box>

          {/* EARN GRID REWARDS CTA */}
          <Box 
            onClick={() => onLaunchOnboarding('scheduled-charging')}
            sx={{ 
              background: `linear-gradient(135deg, ${kia.accent} 0%, ${kia.accentDark} 100%)`,
              borderRadius: 2, p: 2, mb: 2, cursor: 'pointer',
              '&:hover': { opacity: 0.95 }
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <BoltIcon sx={{ color: kia.bg, fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: kia.bg, fontFamily: 'Inter, sans-serif' }}>
                Earn Grid Rewards
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.7)', mb: 1, fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
              Set up smart charging to save money and earn rewards for flexible charging.
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 3, px: 1.5, py: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: kia.bg, fontFamily: 'Inter, sans-serif' }}>Get Started</Typography>
              <ChevronRightIcon sx={{ color: kia.bg, fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        {/* Save Button */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ backgroundColor: kia.text, borderRadius: 2, py: 1.5, textAlign: 'center', cursor: 'pointer' }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: kia.bg, fontFamily: 'Inter, sans-serif' }}>Save</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Main render - switch between screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return renderHome();
      case 'control':
        return renderControl();
      case 'charging-settings':
        return renderChargingSettings();
      case 'scheduled-charging':
        return renderScheduledCharging();
      default:
        return renderHome();
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 390, 
      height: '100vh',
      maxHeight: 844,
      margin: '0 auto',
      backgroundColor: kia.bg,
      overflow: 'hidden',
      borderRadius: { xs: 0, sm: '24px' },
      boxShadow: { xs: 'none', sm: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }
    }}>
      {renderScreen()}
    </Box>
  );
}

export default KiaAppMock;
