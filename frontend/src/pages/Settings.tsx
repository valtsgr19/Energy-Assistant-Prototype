/**
 * Settings View
 * 
 * Allows users to manage their profile, solar system, EVs, and batteries
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsApi, UserProfile, ElectricVehicle, HomeBattery } from '../api/settings';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modal states
  const [showEVModal, setShowEVModal] = useState(false);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [showSolarModal, setShowSolarModal] = useState(false);
  const [editingEV, setEditingEV] = useState<ElectricVehicle | null>(null);
  const [editingBattery, setEditingBattery] = useState<HomeBattery | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await settingsApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteEV = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) {
      return;
    }

    try {
      await settingsApi.deleteEV(vehicleId);
      showSuccess('Vehicle removed successfully');
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const handleDeleteBattery = async (batteryId: string) => {
    if (!confirm('Are you sure you want to remove this battery?')) {
      return;
    }

    try {
      await settingsApi.deleteBattery(batteryId);
      showSuccess('Battery removed successfully');
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete battery');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading settings..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Demo Mode Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
            <span className="text-lg">🎭</span>
            <span className="font-medium">Demo Mode</span>
            <span className="hidden sm:inline">- Exploring with simulated energy data</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your energy profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Account Overview */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Energy Account ID:</span>
              <span className="font-medium truncate ml-2">{profile?.energyAccountId}</span>
            </div>
          </div>
        </div>

        {/* Solar System */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Solar System</h2>
            <button
              onClick={() => setShowSolarModal(true)}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 sm:px-0 sm:py-0"
            >
              Edit
            </button>
          </div>
          
          {profile?.solarSystem?.hasSolar ? (
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">System Size:</span>
                <span className="font-medium">{profile.solarSystem.systemSizeKw} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Panel Tilt:</span>
                <span className="font-medium">{profile.solarSystem.tiltDegrees}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orientation:</span>
                <span className="font-medium">{profile.solarSystem.orientation}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No solar system configured</p>
          )}
        </div>

        {/* Electric Vehicles */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Electric Vehicles</h2>
            <button
              onClick={() => {
                setEditingEV(null);
                setShowEVModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Add EV
            </button>
          </div>

          {profile?.evs && profile.evs.length > 0 ? (
            <div className="space-y-4">
              {profile.evs.map((ev) => (
                <div key={ev.vehicleId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{ev.make} {ev.model}</h3>
                      <p className="text-sm text-gray-600">Battery: {ev.batteryCapacityKwh} kWh</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingEV(ev);
                          setShowEVModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEV(ev.vehicleId)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Charging Speed:</span>
                      <span className="ml-2 font-medium">{ev.chargingSpeedKw} kW</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily Miles:</span>
                      <span className="ml-2 font-medium">{ev.averageDailyMiles} mi</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No electric vehicles configured</p>
          )}
        </div>

        {/* Home Batteries */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Home Batteries</h2>
            <button
              onClick={() => {
                setEditingBattery(null);
                setShowBatteryModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Add Battery
            </button>
          </div>

          {profile?.batteries && profile.batteries.length > 0 ? (
            <div className="space-y-4">
              {profile.batteries.map((battery) => (
                <div key={battery.batteryId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Home Battery</h3>
                      <p className="text-sm text-gray-600">Capacity: {battery.capacityKwh} kWh</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingBattery(battery);
                          setShowBatteryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBattery(battery.batteryId)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Power Rating:</span>
                    <span className="ml-2 font-medium">{battery.powerKw} kW</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No home batteries configured</p>
          )}
        </div>
      </div>

      {/* EV Modal */}
      {showEVModal && (
        <EVModal
          ev={editingEV}
          onClose={() => {
            setShowEVModal(false);
            setEditingEV(null);
          }}
          onSuccess={() => {
            setShowEVModal(false);
            setEditingEV(null);
            showSuccess(editingEV ? 'Vehicle updated successfully' : 'Vehicle added successfully');
            loadProfile();
          }}
        />
      )}

      {/* Battery Modal */}
      {showBatteryModal && (
        <BatteryModal
          battery={editingBattery}
          onClose={() => {
            setShowBatteryModal(false);
            setEditingBattery(null);
          }}
          onSuccess={() => {
            setShowBatteryModal(false);
            setEditingBattery(null);
            showSuccess(editingBattery ? 'Battery updated successfully' : 'Battery added successfully');
            loadProfile();
          }}
        />
      )}

      {/* Solar Modal */}
      {showSolarModal && profile && (
        <SolarModal
          solarSystem={profile.solarSystem}
          onClose={() => setShowSolarModal(false)}
          onSuccess={() => {
            setShowSolarModal(false);
            showSuccess('Solar system updated successfully');
            loadProfile();
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}


// EV Modal Component
interface EVModalProps {
  ev: ElectricVehicle | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EVModal({ ev, onClose, onSuccess }: EVModalProps) {
  const [make, setMake] = useState(ev?.make || '');
  const [model, setModel] = useState(ev?.model || '');
  const [chargingSpeedKw, setChargingSpeedKw] = useState(ev?.chargingSpeedKw.toString() || '7');
  const [averageDailyMiles, setAverageDailyMiles] = useState(ev?.averageDailyMiles.toString() || '30');
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState(ev?.batteryCapacityKwh.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Client-side validation
      const chargingSpeed = parseFloat(chargingSpeedKw);
      const dailyMiles = parseFloat(averageDailyMiles);
      const batteryCapacity = batteryCapacityKwh ? parseFloat(batteryCapacityKwh) : undefined;

      if (chargingSpeed <= 0 || chargingSpeed > 350) {
        setError('Charging speed must be between 0.1 and 350 kW');
        setLoading(false);
        return;
      }

      if (dailyMiles < 0 || dailyMiles > 500) {
        setError('Average daily miles must be between 0 and 500');
        setLoading(false);
        return;
      }

      if (batteryCapacity !== undefined && (batteryCapacity <= 0 || batteryCapacity > 200)) {
        setError('Battery capacity must be between 0.1 and 200 kWh');
        setLoading(false);
        return;
      }

      const data = {
        make,
        model,
        chargingSpeedKw: chargingSpeed,
        averageDailyMiles: dailyMiles,
        ...(batteryCapacity && { batteryCapacityKwh: batteryCapacity }),
      };

      if (ev) {
        await settingsApi.updateEV(ev.vehicleId, data);
      } else {
        await settingsApi.createEV(data);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {ev ? 'Edit Vehicle' : 'Add Vehicle'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tesla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Model 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charging Speed (kW) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="350"
              value={chargingSpeedKw}
              onChange={(e) => setChargingSpeedKw(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="7.0"
            />
            <p className="text-xs text-gray-500 mt-1">Level 2: 7-11 kW, DC Fast: 50-350 kW</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Daily Miles *
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="500"
              value={averageDailyMiles}
              onChange={(e) => setAverageDailyMiles(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Battery Capacity (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="200"
              value={batteryCapacityKwh}
              onChange={(e) => setBatteryCapacityKwh(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-detected from make/model"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to auto-detect</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Battery Modal Component
interface BatteryModalProps {
  battery: HomeBattery | null;
  onClose: () => void;
  onSuccess: () => void;
}

function BatteryModal({ battery, onClose, onSuccess }: BatteryModalProps) {
  const [powerKw, setPowerKw] = useState(battery?.powerKw.toString() || '5');
  const [capacityKwh, setCapacityKwh] = useState(battery?.capacityKwh.toString() || '13.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Client-side validation
      const power = parseFloat(powerKw);
      const capacity = parseFloat(capacityKwh);

      if (power <= 0 || power > 50) {
        setError('Power rating must be between 0.1 and 50 kW');
        setLoading(false);
        return;
      }

      if (capacity <= 0 || capacity > 200) {
        setError('Capacity must be between 0.1 and 200 kWh');
        setLoading(false);
        return;
      }

      const data = {
        powerKw: power,
        capacityKwh: capacity,
      };

      if (battery) {
        await settingsApi.updateBattery(battery.batteryId, data);
      } else {
        await settingsApi.createBattery(data);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save battery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {battery ? 'Edit Battery' : 'Add Battery'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Power Rating (kW) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={powerKw}
              onChange={(e) => setPowerKw(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5.0"
            />
            <p className="text-xs text-gray-500 mt-1">Typical range: 3-10 kW for home batteries</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (kWh) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="200"
              value={capacityKwh}
              onChange={(e) => setCapacityKwh(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="13.5"
            />
            <p className="text-xs text-gray-500 mt-1">Typical range: 5-20 kWh for home batteries</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Solar Modal Component
interface SolarModalProps {
  solarSystem: { hasSolar: boolean; systemSizeKw: number | null; tiltDegrees: number | null; orientation: string | null } | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SolarModal({ solarSystem, onClose, onSuccess }: SolarModalProps) {
  const [hasSolar, setHasSolar] = useState(solarSystem?.hasSolar || false);
  const [systemSizeKw, setSystemSizeKw] = useState(solarSystem?.systemSizeKw?.toString() || '');
  const [tiltDegrees, setTiltDegrees] = useState(solarSystem?.tiltDegrees?.toString() || '');
  const [orientation, setOrientation] = useState(solarSystem?.orientation || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Client-side validation
      if (hasSolar) {
        const size = parseFloat(systemSizeKw);
        const tilt = parseFloat(tiltDegrees);

        if (size <= 0 || size > 100) {
          setError('System size must be between 0.1 and 100 kW');
          setLoading(false);
          return;
        }

        if (tilt < 0 || tilt > 90) {
          setError('Tilt degrees must be between 0 and 90');
          setLoading(false);
          return;
        }

        if (!orientation) {
          setError('Please select an orientation');
          setLoading(false);
          return;
        }
      }

      const data = {
        hasSolar,
        ...(hasSolar && {
          systemSizeKw: parseFloat(systemSizeKw),
          tiltDegrees: parseFloat(tiltDegrees),
          orientation,
        }),
      };

      await settingsApi.updateSolarSystem(data);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update solar system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Edit Solar System
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Do you have solar panels? *
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setHasSolar(true)}
                className={`w-full px-4 py-3 border-2 rounded-md text-left transition-colors ${
                  hasSolar
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Yes, I have solar panels</div>
              </button>
              <button
                type="button"
                onClick={() => setHasSolar(false)}
                className={`w-full px-4 py-3 border-2 rounded-md text-left transition-colors ${
                  !hasSolar
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">No, I don't have solar</div>
              </button>
            </div>
          </div>

          {hasSolar && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Size (kW) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={systemSizeKw}
                  onChange={(e) => setSystemSizeKw(e.target.value)}
                  required={hasSolar}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panel Tilt (degrees) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="90"
                  value={tiltDegrees}
                  onChange={(e) => setTiltDegrees(e.target.value)}
                  required={hasSolar}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientation *
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  required={hasSolar}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select orientation</option>
                  <option value="N">North</option>
                  <option value="NE">Northeast</option>
                  <option value="E">East</option>
                  <option value="SE">Southeast</option>
                  <option value="S">South</option>
                  <option value="SW">Southwest</option>
                  <option value="W">West</option>
                  <option value="NW">Northwest</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
