import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Grid, Radio, RadioGroup, FormControl, FormControlLabel, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { kaluzaColors, SizeVariation, spacing } from '../theme';

type OnboardingStep = 
  | 'bill-upload'
  | 'bill-processing'
  | 'tariff-confirmation'
  | 'tariff-editor'
  | 'optimisation-preferences'
  | 'completion';

interface OnboardingFlowProps {
  onReturnToApp?: () => void;
}

function OnboardingFlow({ onReturnToApp }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('bill-upload');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Bill upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [skipBillUpload, setSkipBillUpload] = useState(false);

  // Tariff state
  const [supplier, setSupplier] = useState('');
  const [tariffName, setTariffName] = useState('');
  const [rateType, setRateType] = useState<'flat' | 'tou'>('flat');
  const [flatRate, setFlatRate] = useState('');
  const [touRates, setTouRates] = useState<Array<{ startTime: string; endTime: string; pricePerKwh: string; label: string }>>([]);
  const [editingRates, setEditingRates] = useState<Array<{ startTime: string; endTime: string; pricePerKwh: string }>>([]);

  // Preferences state
  const [optimisationMode, setOptimisationMode] = useState<'fully_managed' | 'events_only'>('fully_managed');

  // Navigation helpers - simple step-by-step back navigation
  const handleBack = () => {
    console.log('handleBack called, current step:', currentStep);
    
    switch (currentStep) {
      case 'bill-upload':
        // Return to Kia app
        console.log('At bill-upload, returning to Kia app');
        if (onReturnToApp) onReturnToApp();
        break;
      case 'tariff-confirmation':
        console.log('Going back to bill-upload');
        setCurrentStep('bill-upload');
        break;
      case 'tariff-editor':
        console.log('Going back to tariff-confirmation');
        setCurrentStep('tariff-confirmation');
        break;
      case 'optimisation-preferences':
        console.log('Going back to tariff-confirmation');
        setCurrentStep('tariff-confirmation');
        break;
      case 'completion':
        console.log('Going back to optimisation-preferences');
        setCurrentStep('optimisation-preferences');
        break;
      default:
        console.log('Unknown step, returning to Kia app');
        if (onReturnToApp) onReturnToApp();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPG, or PNG file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleBillUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile && !skipBillUpload) {
      setError('Please upload a bill or skip to manual entry');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (uploadedFile) {
        // Don't add bill-processing to history, it's just a loading state
        setCurrentStep('bill-processing');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pre-populate with extracted tariff data (E.On Next Flex)
        setSupplier('E.On Next');
        setTariffName('Next Flex');
        setRateType('tou');
        setTouRates([
          { startTime: '00:00', endTime: '07:00', pricePerKwh: '13.0', label: 'Off-peak' },
          { startTime: '07:00', endTime: '00:00', pricePerKwh: '30.0', label: 'Peak' }
        ]);
        setCurrentStep('tariff-confirmation');
      } else {
        setCurrentStep('tariff-confirmation');
      }
    } catch (err: any) {
      setError('Failed to process bill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTariffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('optimisation-preferences');
    } catch (err: any) {
      setError('Failed to save tariff. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep('completion');
    } catch (err: any) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToApp = () => {
    if (onReturnToApp) {
      onReturnToApp();
    }
  };

  // Tariff editor helpers
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const calculateGaps = (rates: Array<{ startTime: string; endTime: string; pricePerKwh: string }>) => {
    if (rates.length === 0) return [{ startTime: '00:00', endTime: '23:59', pricePerKwh: '' }];
    const sorted = [...rates].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const gaps: Array<{ startTime: string; endTime: string; pricePerKwh: string }> = [];
    let currentMinute = 0;
    sorted.forEach(rate => {
      const rateStart = timeToMinutes(rate.startTime);
      const rateEnd = timeToMinutes(rate.endTime);
      if (rateEnd < rateStart) {
        if (currentMinute < rateStart) gaps.push({ startTime: minutesToTime(currentMinute), endTime: rate.startTime, pricePerKwh: '' });
        currentMinute = 0;
      } else {
        if (currentMinute < rateStart) gaps.push({ startTime: minutesToTime(currentMinute), endTime: rate.startTime, pricePerKwh: '' });
        currentMinute = rateEnd;
      }
    });
    if (currentMinute < 24 * 60) gaps.push({ startTime: minutesToTime(currentMinute), endTime: '23:59', pricePerKwh: '' });
    return gaps;
  };

  const handleAddTimeWindow = () => setEditingRates([...editingRates, { startTime: '00:00', endTime: '23:59', pricePerKwh: '' }]);
  const handleRemoveTimeWindow = (index: number) => setEditingRates(editingRates.filter((_, i) => i !== index));
  const handleUpdateTimeWindow = (index: number, field: 'startTime' | 'endTime' | 'pricePerKwh', value: string) => {
    const updated = [...editingRates];
    updated[index] = { ...updated[index], [field]: value };
    setEditingRates(updated);
  };

  const handleEnterTariffEditor = () => {
    setEditingRates(touRates.map(r => ({ startTime: r.startTime, endTime: r.endTime, pricePerKwh: r.pricePerKwh })));
    navigateToStep('tariff-editor');
  };

  const handleBackToConfirmation = () => {
    setEditingRates([]);
    // Use handleBack to go back properly through history
    handleBack();
  };

  const handleSaveEditedRates = () => {
    const labeled = editingRates.map((rate, index) => ({ ...rate, label: `Rate ${index + 1}` }));
    setTouRates(labeled);
    setRateType('tou');
    // Go back to tariff confirmation
    handleBack();
  };

  const optimisationModes = [
    { value: 'fully_managed', label: 'Fully Managed Optimisation', description: 'Kaluza manages your EV charging. Maximise bill savings while participating in grid events' },
    { value: 'events_only', label: 'Events Only', description: 'Set your own charging schedule. Kaluza will try and generate revenue through specific grid events while respecting that schedule' }
  ];

  // Header with back button
  const Header = ({ showBack = true }: { showBack?: boolean }) => {
    const shouldShowBack = showBack && currentStep !== 'bill-processing';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing(3), position: 'relative' }}>
        {shouldShowBack && (
          <IconButton 
            onClick={handleBack} 
            sx={{ 
              position: 'absolute',
              left: 0,
              color: kaluzaColors.colorRoles.textPrimary, 
              backgroundColor: kaluzaColors.envyColors[50],
              '&:hover': { backgroundColor: kaluzaColors.envyColors[100] },
              zIndex: 1
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography sx={{ fontSize: SizeVariation.x06, fontWeight: 700, color: kaluzaColors.spindleColors[600] }}>
            Kaluza Smart Charging
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%', maxWidth: '400px', height: '100vh', maxHeight: '800px',
      backgroundColor: kaluzaColors.additionalColors.white, mx: 'auto', overflow: 'auto',
      borderRadius: { xs: 0, sm: '24px' }, boxShadow: { xs: 'none', sm: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
    }}>
      <Box sx={{ py: spacing(3), px: spacing(3) }}>
        {/* Header with back button */}
        <Header />

        {/* Progress indicator */}
        <Box sx={{ mb: spacing(3), textAlign: 'center' }}>
          <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>
            Step {currentStep === 'bill-upload' || currentStep === 'bill-processing' ? '1' : 
                  currentStep === 'tariff-confirmation' || currentStep === 'tariff-editor' ? '2' : 
                  currentStep === 'optimisation-preferences' ? '3' : '4'} of 4
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: spacing(2) }}>{error}</Alert>}

        {/* Bill Upload Step */}
        {currentStep === 'bill-upload' && (
          <Box component="form" onSubmit={handleBillUpload}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x07, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(1), textAlign: 'center' }}>
              Upload Your Electricity Bill
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(3), textAlign: 'center' }}>
              We'll extract your tariff information automatically
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(3) }}>
              <Box
                sx={{ border: `2px dashed ${kaluzaColors.envyColors[300]}`, borderRadius: '1rem', p: spacing(3), textAlign: 'center',
                  backgroundColor: kaluzaColors.additionalColors.white, mb: spacing(2), cursor: 'pointer',
                  '&:hover': { borderColor: kaluzaColors.envyColors[500], backgroundColor: kaluzaColors.envyColors[50] }
                }}
                onClick={() => document.getElementById('bill-upload-input')?.click()}
              >
                <input id="bill-upload-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                {uploadedFile ? (
                  <Box>
                    <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.envyColors[700], mb: spacing(0.5) }}>✓ {uploadedFile.name}</Typography>
                    <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography sx={{ fontSize: SizeVariation.x06, mb: spacing(1) }}>📄</Typography>
                    <Typography sx={{ fontSize: SizeVariation.x04, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(0.5) }}>Click to upload</Typography>
                    <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>PDF, JPG, or PNG (max 10MB)</Typography>
                  </Box>
                )}
              </Box>
              <Button type="submit" variant="contained" fullWidth disabled={isLoading || (!uploadedFile && !skipBillUpload)}
                sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(1.5),
                  fontSize: SizeVariation.x04, fontWeight: 500, borderRadius: '2rem', textTransform: 'none', mb: spacing(1),
                  '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
              <Button variant="text" fullWidth onClick={() => { setSkipBillUpload(true); setCurrentStep('tariff-confirmation'); }}
                sx={{ color: kaluzaColors.colorRoles.textSecondary, textTransform: 'none', fontSize: SizeVariation.x03 }}>
                Skip and enter tariff manually
              </Button>
            </Box>
          </Box>
        )}

        {/* Bill Processing Step */}
        {currentStep === 'bill-processing' && (
          <Box sx={{ textAlign: 'center', py: spacing(4) }}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x07, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(1) }}>
              Processing Your Bill
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4) }}>
              Extracting tariff information...
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: spacing(3) }}>
              <Box sx={{ width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${kaluzaColors.envyColors[200]}`,
                borderTopColor: kaluzaColors.envyColors[500], animation: 'spin 1s linear infinite',
                '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </Box>
          </Box>
        )}

        {/* Tariff Confirmation Step */}
        {currentStep === 'tariff-confirmation' && (
          <Box component="form" onSubmit={handleTariffSubmit}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x07, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(1), textAlign: 'center' }}>
              {uploadedFile ? 'Confirm Your Tariff' : 'Enter Your Tariff'}
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(3), textAlign: 'center' }}>
              {uploadedFile ? 'We extracted this from your bill' : 'Enter your electricity tariff details'}
            </Typography>

            {uploadedFile && <Alert severity="success" sx={{ mb: spacing(2), fontSize: SizeVariation.x03 }}>✓ Tariff extracted successfully!</Alert>}

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(3) }}>
              <TextField fullWidth label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required size="small"
                sx={{ mb: spacing(2), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              <TextField fullWidth label="Tariff Name" value={tariffName} onChange={(e) => setTariffName(e.target.value)} required size="small"
                sx={{ mb: spacing(2), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              
              {rateType === 'tou' && touRates.length > 0 ? (
                <Box sx={{ mb: spacing(2) }}>
                  <Typography sx={{ fontSize: SizeVariation.x04, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(1) }}>
                    Time of Use Rates
                  </Typography>
                  {touRates.map((rate, index) => (
                    <Box key={index} sx={{ mb: spacing(1), p: spacing(1.5), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.5rem' }}>
                      <Typography sx={{ fontSize: SizeVariation.x04, fontWeight: 500, color: kaluzaColors.envyColors[700] }}>{rate.label}</Typography>
                      <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>{rate.pricePerKwh} p/kWh • {rate.startTime} - {rate.endTime}</Typography>
                    </Box>
                  ))}
                  <Button variant="text" size="small" onClick={handleEnterTariffEditor}
                    sx={{ color: kaluzaColors.envyColors[600], textTransform: 'none', fontSize: SizeVariation.x03, mt: spacing(1), fontWeight: 500 }}>
                    Edit Tariff Rates
                  </Button>
                </Box>
              ) : (
                <TextField fullWidth label="Price per kWh (pence)" type="number" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} required
                  size="small" inputProps={{ step: '0.01', min: '0' }}
                  sx={{ mb: spacing(2), '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
              )}

              <Button type="submit" variant="contained" fullWidth disabled={isLoading}
                sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(1.5),
                  fontSize: SizeVariation.x04, fontWeight: 500, borderRadius: '2rem', textTransform: 'none',
                  '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Tariff Editor Step */}
        {currentStep === 'tariff-editor' && (
          <Box>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x07, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(1), textAlign: 'center' }}>
              Edit Tariff Rates
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(3), textAlign: 'center' }}>
              Add time windows and specify rates
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(3) }}>
              {editingRates.map((rate, index) => (
                <Box key={index} sx={{ mb: spacing(2), p: spacing(2), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.75rem', border: `1px solid ${kaluzaColors.envyColors[200]}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing(1) }}>
                    <Typography sx={{ fontSize: SizeVariation.x04, fontWeight: 500, color: kaluzaColors.colorRoles.textPrimary }}>
                      Time Window {index + 1}
                    </Typography>
                    {editingRates.length > 1 && (
                      <Button size="small" onClick={() => handleRemoveTimeWindow(index)}
                        sx={{ color: kaluzaColors.colorRoles.textSecondary, textTransform: 'none', fontSize: SizeVariation.x02, minWidth: 'auto', p: 0.5 }}>
                        Remove
                      </Button>
                    )}
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <TextField fullWidth label="Start" type="time" value={rate.startTime} size="small"
                        onChange={(e) => handleUpdateTimeWindow(index, 'startTime', e.target.value)} required
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth label="End" type="time" value={rate.endTime} size="small"
                        onChange={(e) => handleUpdateTimeWindow(index, 'endTime', e.target.value)} required
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth label="p/kWh" type="number" value={rate.pricePerKwh} size="small"
                        onChange={(e) => handleUpdateTimeWindow(index, 'pricePerKwh', e.target.value)} required
                        inputProps={{ step: '0.01', min: '0' }}
                        sx={{ '& .MuiOutlinedInput-root': { backgroundColor: kaluzaColors.additionalColors.white } }} />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {editingRates.length > 0 && calculateGaps(editingRates).length > 0 && (
                <Box sx={{ mb: spacing(2) }}>
                  <Alert severity="warning" sx={{ mb: spacing(1), fontSize: SizeVariation.x03 }}>Time periods not covered:</Alert>
                  {calculateGaps(editingRates).map((gap, index) => (
                    <Box key={index} sx={{ mb: spacing(0.5), p: spacing(1), backgroundColor: kaluzaColors.waferColors[100], borderRadius: '0.5rem', border: `1px dashed ${kaluzaColors.waferColors[400]}` }}>
                      <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>
                        {gap.startTime} - {gap.endTime}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Button variant="outlined" fullWidth onClick={handleAddTimeWindow}
                sx={{ mb: spacing(2), borderColor: kaluzaColors.envyColors[300], color: kaluzaColors.envyColors[700],
                  textTransform: 'none', fontSize: SizeVariation.x04, py: spacing(1),
                  '&:hover': { borderColor: kaluzaColors.envyColors[500], backgroundColor: kaluzaColors.envyColors[50] } }}>
                + Add Time Window
              </Button>

              <Box sx={{ display: 'flex', gap: spacing(1) }}>
                <Button variant="outlined" fullWidth onClick={handleBackToConfirmation}
                  sx={{ borderColor: kaluzaColors.envyColors[300], color: kaluzaColors.colorRoles.textSecondary, py: spacing(1.5),
                    fontSize: SizeVariation.x04, fontWeight: 500, borderRadius: '2rem', textTransform: 'none',
                    '&:hover': { borderColor: kaluzaColors.envyColors[400], backgroundColor: kaluzaColors.envyColors[50] } }}>
                  Back
                </Button>
                <Button variant="contained" fullWidth onClick={handleSaveEditedRates}
                  disabled={editingRates.length === 0 || editingRates.some(r => !r.startTime || !r.endTime || !r.pricePerKwh)}
                  sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(1.5),
                    fontSize: SizeVariation.x04, fontWeight: 500, borderRadius: '2rem', textTransform: 'none',
                    '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                  Save Rates
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Optimisation Preferences Step */}
        {currentStep === 'optimisation-preferences' && (
          <Box component="form" onSubmit={handlePreferencesSubmit}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x07, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(1), textAlign: 'center' }}>
              Optimisation Preferences
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(3), textAlign: 'center' }}>
              How would you like us to manage your smart charging?
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(3) }}>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup value={optimisationMode} onChange={(e) => setOptimisationMode(e.target.value as any)}>
                  {optimisationModes.map((mode) => (
                    <Box key={mode.value}
                      sx={{ mb: spacing(2), p: spacing(2), backgroundColor: kaluzaColors.additionalColors.white, borderRadius: '0.75rem',
                        border: `2px solid ${optimisationMode === mode.value ? kaluzaColors.envyColors[500] : kaluzaColors.envyColors[200]}`,
                        cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: kaluzaColors.envyColors[400] } }}
                      onClick={() => setOptimisationMode(mode.value as any)}>
                      <FormControlLabel value={mode.value} control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 20 }, color: kaluzaColors.envyColors[400], '&.Mui-checked': { color: kaluzaColors.envyColors[500] } }} />}
                        label={
                          <Box>
                            <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 600, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(0.5) }}>
                              {mode.label}
                            </Typography>
                            <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary, lineHeight: 1.4 }}>
                              {mode.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }} />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              <Button type="submit" variant="contained" fullWidth disabled={isLoading}
                sx={{ backgroundColor: kaluzaColors.envyColors[500], color: kaluzaColors.additionalColors.white, py: spacing(1.5),
                  fontSize: SizeVariation.x04, fontWeight: 500, borderRadius: '2rem', textTransform: 'none', mt: spacing(2),
                  '&:hover': { backgroundColor: kaluzaColors.envyColors[600] } }}>
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Completion Step */}
        {currentStep === 'completion' && (
          <Box sx={{ textAlign: 'center', py: spacing(2) }}>
            <Typography variant="h2" sx={{ fontSize: SizeVariation.x08, fontWeight: 600, color: kaluzaColors.envyColors[600], mb: spacing(2) }}>
              🎉 All Set!
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x05, color: kaluzaColors.colorRoles.textPrimary, mb: spacing(1) }}>
              Smart charging is now active
            </Typography>
            <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textSecondary, mb: spacing(4) }}>
              We'll optimize your charging to save you money
            </Typography>

            <Box sx={{ backgroundColor: kaluzaColors.envyColors[50], borderRadius: '1rem', p: spacing(3), textAlign: 'left', mb: spacing(3) }}>
              <Typography sx={{ fontSize: SizeVariation.x05, fontWeight: 500, color: kaluzaColors.spindleColors[800], mb: spacing(2) }}>
                What happens next?
              </Typography>
              <Box sx={{ mb: spacing(1.5) }}>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>✓ Smart charging activated</Typography>
                <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>Your EV will charge at optimal times</Typography>
              </Box>
              <Box sx={{ mb: spacing(1.5) }}>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>✓ Earning rewards</Typography>
                <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>You'll earn for flexible charging</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: SizeVariation.x04, color: kaluzaColors.colorRoles.textPrimary, fontWeight: 500 }}>✓ Grid support</Typography>
                <Typography sx={{ fontSize: SizeVariation.x03, color: kaluzaColors.colorRoles.textSecondary }}>Help balance the grid automatically</Typography>
              </Box>
            </Box>

            <Button variant="contained" fullWidth onClick={handleReturnToApp}
              sx={{ backgroundColor: kaluzaColors.spindleColors[500], color: kaluzaColors.additionalColors.white, py: spacing(1.5),
                fontSize: SizeVariation.x05, fontWeight: 600, borderRadius: '2rem', textTransform: 'none',
                '&:hover': { backgroundColor: kaluzaColors.spindleColors[600] } }}>
              Return to Kia App
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default OnboardingFlow;
