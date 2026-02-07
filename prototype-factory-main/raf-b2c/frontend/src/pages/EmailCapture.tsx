import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Alert } from '@mui/material';
import { kaluzaColors, SizeVariation, spacing } from '../theme';
import { usersApi } from '../api/users';

function EmailCapture() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await usersApi.createUser(email);
      setUserId(response.userId);
      setStep('verify');
      console.log('Check console for verification code (dev mode)');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await usersApi.verifyEmail(userId, verificationCode);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: spacing(8) }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: SizeVariation.x09,
            fontWeight: 500,
            color: kaluzaColors.spindleColors[800],
            mb: spacing(2),
            textAlign: 'center'
          }}
        >
          {step === 'email' ? 'Get Started' : 'Verify Your Email'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: SizeVariation.x05,
            color: kaluzaColors.colorRoles.textSecondary,
            mb: spacing(4),
            textAlign: 'center'
          }}
        >
          {step === 'email'
            ? 'Enter your email to begin the onboarding process'
            : `We've sent a verification code to ${email}`}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: spacing(3) }}>
            {error}
          </Alert>
        )}

        {step === 'email' ? (
          <Box
            component="form"
            onSubmit={handleEmailSubmit}
            sx={{
              backgroundColor: kaluzaColors.envyColors[50],
              borderRadius: '1rem',
              p: spacing(4)
            }}
          >
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                mb: spacing(3),
                '& .MuiOutlinedInput-root': {
                  backgroundColor: kaluzaColors.additionalColors.white
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                backgroundColor: kaluzaColors.envyColors[500],
                color: kaluzaColors.additionalColors.white,
                py: spacing(2),
                fontSize: SizeVariation.x05,
                fontWeight: 500,
                borderRadius: '2rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: kaluzaColors.envyColors[600]
                }
              }}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleVerifySubmit}
            sx={{
              backgroundColor: kaluzaColors.envyColors[50],
              borderRadius: '1rem',
              p: spacing(4)
            }}
          >
            <Alert severity="info" sx={{ mb: spacing(3) }}>
              Development mode: Use code <strong>123456</strong>
            </Alert>

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              sx={{
                mb: spacing(3),
                '& .MuiOutlinedInput-root': {
                  backgroundColor: kaluzaColors.additionalColors.white
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                backgroundColor: kaluzaColors.envyColors[500],
                color: kaluzaColors.additionalColors.white,
                py: spacing(2),
                fontSize: SizeVariation.x05,
                fontWeight: 500,
                borderRadius: '2rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: kaluzaColors.envyColors[600]
                }
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default EmailCapture;
