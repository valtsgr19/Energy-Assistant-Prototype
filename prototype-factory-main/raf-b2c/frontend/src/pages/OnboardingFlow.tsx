import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Alert, Checkbox, FormControlLabel, Slider, Radio, RadioGroup, FormControl, FormLabel, Grid, Card, CardActionArea, CardContent, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { kaluzaColors, SizeVariation, spacing } from '../theme';
import { usersApi } from '../api/users';
import { onboardingApi, TariffData, ChargingPreferences } from '../api/onboarding';

type OnboardingStep = 
  | 'bill-upload'
  | 'bill-processing'
  | 'address-consent'
  | 'tariff-confirmation'
  | 'tariff-editor'
  | 'charging-preferences'
  | 'manufacturer-selection'
  | 'activated';

function OnboardingFlow() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('bill-upload');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Address & Consent state
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [consentGranted, setConsentGranted] = useState(false);

  // Bill upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [billProcessing, setBillProcessing] = useState(false);
  const [skipBillUpload, setSkipBillUpload] = useState(false);

  // Tariff state
  const [supplier, setSupplier] = useState('');
  const [tariffName, setTariffName] = useState('');
  const [rateType, setRateType] = useState<'flat' | 'tou'>('flat');
  const [flatRate, setFlatRate] = useState('');
  const [touRates, setTouRates] = useState<Array<{ startTime: string; endTime: string; pricePerKwh: string; label: string }>>([]);
  const [savedTouRates, setSavedTouRates] = useState<Array<{ startTime: string; endTime: string; pricePerKwh: string; label: string }>>([]);
  const [editingRates, setEditingRates] = useState<Array<{ startTime: string; endTime: string; pricePerKwh: string }>>([]);

  // Charging preferences state
  const [optimisationMode, setOptimisationMode] = useState<'fully_managed' | 'events_only'>('fully_managed');

  // Manufacturer state
  const [manufacturers, setManufacturers] = useState<Array<{ id: string; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
      return;
    }

    // Load progress
    loadProgress();
  }, [userId, navigate]);

  const loadProgress = async () => {
    if (!userId) return;

    try {
      const progress = await usersApi.getProgress(userId);
      if (progress.currentStep && progress.currentStep !== 'landing') {
        setCurrentStep(progress.currentStep as OnboardingStep);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleBillUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!uploadedFile && !skipBillUpload) {
      setError('Please upload a bill or skip to manual entry');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (uploadedFile) {
        // Simulate bill processing
        setBillProcessing(true);
        setCurrentStep('bill-processing');
        
        // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful OCR extraction with mock data
        setBillProcessing(false);
        
        // Pre-populate with extracted tariff data
        setSupplier('E.On Next');
        setTariffName('Next Flex');
        setRateType('tou');
        setTouRates([
          { startTime: '00:00', endTime: '07:00', pricePerKwh: '30.0', label: 'Peak' },
          { startTime: '07:00', endTime: '00:00', pricePerKwh: '13.0', label: 'Off-peak' }
        ]);
        
        setCurrentStep('tariff-confirmation');
      } else {
        // Skip to manual entry
        setCurrentStep('tariff-confirmation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process bill. Please try again.');
      setBillProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPG, or PNG file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!consentGranted) {
      setError('You must grant consent to proceed');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onboardingApi.saveSite(userId, {
        address,
        postcode,
        country,
        consentGranted
      });
      setCurrentStep('tariff-confirmation');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTariffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError(null);
    setIsLoading(true);

    try {
      const tariffData: TariffData = {
        supplier,
        tariffName,
        rateType,
        rates: rateType === 'flat' 
          ? [{
              startTime: '00:00',
              endTime: '23:59',
              pricePerKwh: parseFloat(flatRate)
            }]
          : touRates.map(rate => ({
              startTime: rate.startTime,
              endTime: rate.endTime,
              pricePerKwh: parseFloat(rate.pricePerKwh)
            }))
      };

      await onboardingApi.saveTariff(userId, tariffData);
      setCurrentStep('charging-preferences');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save tariff. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError(null);
    setIsLoading(true);

    try {
      const prefs: ChargingPreferences = {
        readyByTime: '00:00',
        minimumSocPercent: 0,
        mode: optimisationMode
      };

      await onboardingApi.savePreferences(userId, prefs);
      
      // Load manufacturers
      const data = await onboardingApi.getManufacturers();
      setManufacturers(data.manufacturers);
      
      setCurrentStep('manufacturer-selection');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManufacturerSelect = async (manufacturerId: string) => {
    if (!userId) return;

    setError(null);
    setIsLoading(true);
    setSelectedManufacturer(manufacturerId);

    try {
      await onboardingApi.saveManufacturer(userId, manufacturerId);
      await onboardingApi.activateVehicle(userId);
      setCurrentStep('activated');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to select manufacturer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate gaps in time coverage
  const calculateGaps = (rates: Array<{ startTime: string; endTime: string; pricePerKwh: string }>) => {
    if (rates.length === 0) {
      return [{ startTime: '00:00', endTime: '23:59', pricePerKwh: '' }];
    }

    // Sort rates by start time
    const sorted = [...rates].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const gaps: Array<{ startTime: string; endTime: string; pricePerKwh: string }> = [];
    
    let currentMinute = 0; // Start of day

    sorted.forEach(rate => {
      const rateStart = timeToMinutes(rate.startTime);
      const rateEnd = timeToMinutes(rate.endTime);

      // Handle wrap-around (e.g., 23:00 to 02:00)
      if (rateEnd < rateStart) {
        // Check gap before this rate
        if (currentMinute < rateStart) {
          gaps.push({
            startTime: minutesToTime(currentMinute),
            endTime: rate.startTime,
            pricePerKwh: ''
          });
        }
        currentMinute = 0; // Reset for next day portion
      } else {
        // Normal case: check if there's a gap
        if (currentMinute < rateStart) {
          gaps.push({
            startTime: minutesToTime(currentMinute),
            endTime: rate.startTime,
            pricePerKwh: ''
          });
        }
        currentMinute = rateEnd;
      }
    });

    // Check if there's a gap at the end of the day
    if (currentMinute < 24 * 60) {
      gaps.push({
        startTime: minutesToTime(currentMinute),
        endTime: '23:59',
        pricePerKwh: ''
      });
    }

    return gaps;
  };

  const handleAddTimeWindow = () => {
    setEditingRates([...editingRates, { startTime: '00:00', endTime: '23:59', pricePerKwh: '' }]);
  };

  const handleRemoveTimeWindow = (index: number) => {
    setEditingRates(editingRates.filter((_, i) => i !== index));
  };

  const handleUpdateTimeWindow = (index: number, field: 'startTime' | 'endTime' | 'pricePerKwh', value: string) => {
    const updated = [...editingRates];
    updated[index] = { ...updated[index], [field]: value };
    setEditingRates(updated);
  };

  const handleEnterTariffEditor = () => {
    // Save current TOU rates and enter editor mode
    setSavedTouRates(touRates);
    setEditingRates(touRates.map(r => ({ startTime: r.startTime, endTime: r.endTime, pricePerKwh: r.pricePerKwh })));
    setCurrentStep('tariff-editor');
  };

  const handleBackToConfirmation = () => {
    // Restore saved rates and go back
    setEditingRates([]);
    setCurrentStep('tariff-confirmation');
  };

  const handleSaveEditedRates = () => {
    // Convert editing rates to display format with labels
    const labeled = editingRates.map((rate, index) => ({
      ...rate,
      label: `Rate ${index + 1}`
    }));
    setTouRates(labeled);
    setRateType('tou');
    setCurrentStep('tariff-confirmation');
  };

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const optimisationModes = [
    {
      value: 'fully_managed',
      label: 'Fully Managed Optimisation',
      description: 'Kaluza manages your EV charging. Maximise bill savings while participating in grid events'
    },
    {
      value: 'events_only',
      label: 'Events Only',
      description: 'Set your own charging schedule. Kaluza will try and generate revenue through specific grid events while respecting that schedule'
    }
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: spacing(8) }}>
        {/* Progress indicator */}
        <Box sx={{ mb: spacing(4), textAlign: 'center' }}>
          <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
            Step {
              currentStep === 'bill-upload' ? '1' : 
              currentStep === 'bill-processing' ? '1' :
              currentStep === 'address-consent' ? '2' : 
              currentStep === 'tariff-confirmation' ? '3' :
              currentStep === 'tariff-editor' ? '3' : 
              currentStep === 'charging-preferences' ? '4' : 
              currentStep === 'manufacturer-selection' ? '5' : '6'
            } of 6
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: spacing(3) }}>
            {error}
          </Alert>
        )}

        {/* Bill Upload Step */}
        {currentStep === 'bill-upload' && (
          <Box component="form" onSubmit={handleBillUpload}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              Upload Your Electricity Bill
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              We'll extract your tariff information automatically
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4) }}>
              <Box
                sx={{
                  border: `2px dashed ${kaluzaColors.envyColors[300]}`,
                  borderRadius: '1rem',
                  p: spacing(4),
                  textAlign: 'center',
                  backgroundColor: kaluzaColors.additionalColors.white,
                  mb: spacing(3),
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: kaluzaColors.envyColors[500],
                    backgroundColor: kaluzaColors.envyColors[50]
                  }
                }}
                onClick={() => document.getElementById('bill-upload-input')?.click()}
              >
                <input
                  id="bill-upload-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {uploadedFile ? (
                  <Box>
                    <Typography sx={{ fontSize: SizeVariation.x06, fontWeight: 500, color: kaluzaColors.envyColors[700], mb: spacing(1) }}>
                      ✓ {uploadedFile.name}
                    </Typography>
                    <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography sx={{ fontSize: SizeVariation.x07, mb: spacing(2) }}>
                      📄
                    </Typography>
                    <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(1) }}>
                      Click to upload or drag and drop
                    </Typography>
                    <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                      PDF, JPG, or PNG (max 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading || (!uploadedFile && !skipBillUpload)}
                sx={{
                  backgroundColor: kaluzaColors.envyColors[500],
                  color: kaluzaColors.additionalColors.white,
                  py: spacing(2),
                  fontSize: SizeVariation.x05,
                  fontWeight: 500,
                  borderRadius: '2rem',
                  textTransform: 'none',
                  mb: spacing(2),
                  '&:hover': { backgroundColor: kaluzaColors.envyColors[600] }
                }}
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={() => {
                  setSkipBillUpload(true);
                  setCurrentStep('tariff-confirmation');
                }}
                sx={{
                  color: kaluzaColors.colorRoles.textSecondary,
                  textTransform: 'none',
                  fontSize: SizeVariation.x04
                }}
              >
                Skip and enter tariff manually
              </Button>
            </Box>
          </Box>
        )}

        {/* Bill Processing Step */}
        {currentStep === 'bill-processing' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2) }}>
              Processing Your Bill
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(6) }}>
              Extracting tariff information...
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: spacing(4) }}>
              <Box
                sx={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: `4px solid ${kaluzaColors.envyColors[200]}`,
                  borderTopColor: kaluzaColors.envyColors[500],
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
            </Box>

            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
              This usually takes a few seconds...
            </Typography>
          </Box>
        )}

        {/* Address & Consent Step */}
        {currentStep === 'address-consent' && (
          <Box component="form" onSubmit={handleAddressSubmit}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              Address & Consent
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              We need your address to access your smart meter data
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4) }}>
              <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              <TextField fullWidth label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              <TextField fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} required sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              
              <FormControlLabel
                control={<Checkbox checked={consentGranted} onChange={(e) => setConsentGranted(e.target.checked)} required />}
                label={
                  <Typography sx={{ fontSize: SizeVariation.x04 }}>
                    I consent to sharing my half-hourly smart meter data for EV charging optimisation
                  </Typography>
                }
                sx={{ mb: spacing(3) }}
              />

              <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(2), fontSize: SizeVariation.x05, fontWeight: 500, borderRadius: '2rem', textTransform: 'none', '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Tariff Confirmation Step */}
        {currentStep === 'tariff-confirmation' && (
          <Box component="form" onSubmit={handleTariffSubmit}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              {uploadedFile ? 'Confirm Your Tariff' : 'Enter Your Tariff'}
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              {uploadedFile ? 'We extracted this information from your bill' : 'Enter your electricity tariff details'}
            </Typography>

            {uploadedFile && (
              <Alert severity="success" sx={{ mb: spacing(3) }}>
                ✓ Tariff extracted successfully! Please review and confirm.
              </Alert>
            )}

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4) }}>
              <TextField fullWidth label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              <TextField fullWidth label="Tariff Name" value={tariffName} onChange={(e) => setTariffName(e.target.value)} required sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              
              {rateType === 'tou' && touRates.length > 0 ? (
                <Box sx={{ mb: spacing(3) }}>
                  <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(2) }}>
                    Time of Use Rates
                  </Typography>
                  {touRates.map((rate, index) => (
                    <Box key={index} sx={{ mb: spacing(2), p: spacing(2), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.5rem' }}>
                      <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.envyColors[700], mb: spacing(1) }}>
                        {rate.label}
                      </Typography>
                      <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                        {rate.pricePerKwh} p/kWh
                      </Typography>
                      <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>
                        Time: {rate.startTime} - {rate.endTime}
                      </Typography>
                    </Box>
                  ))}
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleEnterTariffEditor}
                    sx={{ color: kaluzaColors.colorRoles.textSecondary, textTransform: 'none', fontSize: SizeVariation.x04 }}
                  >
                    Edit Tariff Rates
                  </Button>
                </Box>
              ) : (
                <TextField fullWidth label="Price per kWh (pence)" type="number" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} required inputProps={{ step: '0.01', min: '0' }} sx={{ mb: spacing(3), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              )}

              <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(2), fontSize: SizeVariation.x05, fontWeight: 500, borderRadius: '2rem', textTransform: 'none', '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Tariff Editor Step */}
        {currentStep === 'tariff-editor' && (
          <Box>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              Edit Tariff Rates
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              Add time windows and specify rates for each period
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4) }}>
              {/* Existing time windows */}
              {editingRates.map((rate, index) => (
                <Box key={index} sx={{ mb: spacing(3), p: spacing(3), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.75rem', border: `1px solid ${kaluzaColors.envyColors[200]}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing(2) }}>
                    <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary }}>
                      Time Window {index + 1}
                    </Typography>
                    {editingRates.length > 1 && (
                      <Button
                        size="small"
                        onClick={() => handleRemoveTimeWindow(index)}
                        sx={{ color: kaluzaColors.colorRoles.textSecondary, textTransform: 'none', fontSize: SizeVariation.x03 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={rate.startTime}
                        onChange={(e) => handleUpdateTimeWindow(index, 'startTime', e.target.value)}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={rate.endTime}
                        onChange={(e) => handleUpdateTimeWindow(index, 'endTime', e.target.value)}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Price (p/kWh)"
                        type="number"
                        value={rate.pricePerKwh}
                        onChange={(e) => handleUpdateTimeWindow(index, 'pricePerKwh', e.target.value)}
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {/* Show gaps */}
              {editingRates.length > 0 && calculateGaps(editingRates).length > 0 && (
                <Box sx={{ mb: spacing(3) }}>
                  <Alert severity="warning" sx={{ mb: spacing(2) }}>
                    The following time periods are not covered:
                  </Alert>
                  {calculateGaps(editingRates).map((gap, index) => (
                    <Box key={index} sx={{ mb: spacing(1), p: spacing(2), backgroundColor: kaluzaColors.waferColors[100], borderRadius: '0.5rem', border: `1px dashed ${kaluzaColors.waferColors[400]}` }}>
                      <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                        {gap.startTime} - {gap.endTime} (no rate specified)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Add time window button */}
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddTimeWindow}
                sx={{
                  mb: spacing(3),
                  borderColor: kaluzaColors.envyColors[300],
                  color: kaluzaColors.envyColors[700],
                  textTransform: 'none',
                  fontSize: SizeVariation.x05,
                  py: spacing(1.5),
                  '&:hover': {
                    borderColor: kaluzaColors.envyColors[500],
                    backgroundColor: kaluzaColors.envyColors[50]
                  }
                }}
              >
                + Add Time Window
              </Button>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: spacing(2) }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBackToConfirmation}
                  sx={{
                    borderColor: kaluzaColors.envyColors[300],
                    color: kaluzaColors.colorRoles.textSecondary,
                    py: spacing(2),
                    fontSize: SizeVariation.x05,
                    fontWeight: 500,
                    borderRadius: '2rem',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: kaluzaColors.envyColors[400],
                      backgroundColor: kaluzaColors.envyColors[50]
                    }
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSaveEditedRates}
                  disabled={editingRates.length === 0 || editingRates.some(r => !r.startTime || !r.endTime || !r.pricePerKwh)}
                  sx={{
                    backgroundColor: kaluzaColors.envyColors[500],
                    color: kaluzaColors.additionalColors.white,
                    py: spacing(2),
                    fontSize: SizeVariation.x05,
                    fontWeight: 500,
                    borderRadius: '2rem',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: kaluzaColors.envyColors[600] }
                  }}
                >
                  Save Rates
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Charging Preferences Step */}
        {currentStep === 'charging-preferences' && (
          <Box component="form" onSubmit={handlePreferencesSubmit}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              Optimisation Preferences
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              How would you like us to manage your smart charging? Choose how much control you'd like
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4) }}>
              <Box sx={{ mb: spacing(4) }}>
                <FormLabel sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(2), display: 'block' }}>
                  Optimisation mode
                </FormLabel>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup value={optimisationMode} onChange={(e) => setOptimisationMode(e.target.value as any)}>
                    {optimisationModes.map((mode) => (
                      <Box key={mode.value} sx={{ mb: spacing(2), p: spacing(3), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.75rem', border: `2px solid ${optimisationMode === mode.value ? kaluzaColors.envyColors[500] : kaluzaColors.envyColors[200]}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: kaluzaColors.envyColors[400] } }} onClick={() => setOptimisationMode(mode.value as any)}>
                        <FormControlLabel value={mode.value} control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} />} label={<Box><Typography sx={{ fontSize: SizeVariation.x06, fontWeight: 600, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(0.5) }}>{mode.label}</Typography><Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, lineHeight: 1.5 }}>{mode.description}</Typography></Box>} sx={{ m: 0, width: '100%' }} />
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>

              <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(2), fontSize: SizeVariation.x05, fontWeight: 500, borderRadius: '2rem', textTransform: 'none', '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Manufacturer Selection Step */}
        {currentStep === 'manufacturer-selection' && (
          <Box>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x09, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2), textAlign: 'center' }}>
              Select Your EV Manufacturer
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4), textAlign: 'center' }}>
              We'll securely connect to your vehicle
            </Typography>

            <Box sx={{ mb: spacing(4) }}>
              <TextField fullWidth placeholder="Search for your EV manufacturer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: kaluzaColors.colorRoles.textSecondary }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '2rem' } }} />
            </Box>

            <Grid container spacing={3}>
              {filteredManufacturers.map((manufacturer) => (
                <Grid item xs={12} sm={6} md={4} key={manufacturer.id}>
                  <Card sx={{ height: '100%', borderRadius: '1rem', transition: 'all 0.2s', opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 16px ${kaluzaColors.spindleColors[200]}` } }}>
                    <CardActionArea onClick={() => handleManufacturerSelect(manufacturer.id)} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: spacing(4), textAlign: 'center', minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: kaluzaColors.envyColors[100], display: 'flex', alignItems: 'center', justifyContent: 'center', mb: spacing(2) }}>
                          <Typography sx={{ fontSize: SizeVariation.x07, fontWeight: 600, color: kaluzaColors.envyColors[700] }}>
                            {manufacturer.name.charAt(0)}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontSize: SizeVariation.x06, fontWeight: 500, color: kaluzaColors.spindleColors[800] }}>
                          {manufacturer.name}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Activated Step */}
        {currentStep === 'activated' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x10, fontWeight: 600, color: kaluzaColors.envyColors[600], mb: spacing(3) }}>
              🎉 You're All Set!
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x06, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(2) }}>
              Your EV is now enrolled in the Virtual Power Plant
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(6) }}>
              We'll start optimizing your charging to save you money and support the grid
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(4), textAlign: 'left' }}>
              <Typography sx={{ fontSize: SizeVariation.x06, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(3) }}>
                What happens next?
              </Typography>
              <Box sx={{ mb: spacing(2) }}>
                <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>
                  ✓ Smart charging activated
                </Typography>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                  Your EV will charge during optimal times
                </Typography>
              </Box>
              <Box sx={{ mb: spacing(2) }}>
                <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>
                  ✓ Earning rewards
                </Typography>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                  You'll start earning rewards for flexible charging
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>
                  ✓ Grid support
                </Typography>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary }}>
                  Help balance the grid and earn rewards
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default OnboardingFlow;
