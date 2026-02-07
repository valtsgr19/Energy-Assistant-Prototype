import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { kaluzaColors, SizeVariation, spacing } from '../theme';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: spacing(8), textAlign: 'center' }}>
        {/* Headline */}
        <Typography
          variant="h1"
          sx={{
            fontSize: SizeVariation.x10,
            fontWeight: 600,
            color: kaluzaColors.spindleColors[800],
            mb: spacing(3)
          }}
        >
          Make Your EV Work Smarter with the Grid
        </Typography>

        {/* Benefits */}
        <Box sx={{ mb: spacing(6) }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: SizeVariation.x06,
              color: kaluzaColors.colorRoles.textSecondary,
              mb: spacing(4)
            }}
          >
            Join the Virtual Power Plant and unlock the full potential of your electric vehicle
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: spacing(4), flexWrap: 'wrap' }}>
            {[
              { title: 'Earn Rewards', desc: 'Get paid for flexible charging' },
              { title: 'Always Ready', desc: 'Your EV charged when you need it' },
              { title: 'Manufacturer Approved', desc: 'Secure, OEM-authorized control' }
            ].map((benefit) => (
              <Box
                key={benefit.title}
                sx={{
                  flex: '1 1 250px',
                  maxWidth: '300px',
                  p: spacing(3),
                  backgroundColor: kaluzaColors.envyColors[50],
                  borderRadius: '1rem'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: SizeVariation.x06,
                    fontWeight: 500,
                    color: kaluzaColors.envyColors[700],
                    mb: spacing(1)
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: SizeVariation.x04,
                    color: kaluzaColors.colorRoles.textSecondary
                  }}
                >
                  {benefit.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* How it works */}
        <Box sx={{ mb: spacing(6) }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: SizeVariation.x08,
              fontWeight: 500,
              color: kaluzaColors.spindleColors[800],
              mb: spacing(3)
            }}
          >
            How It Works
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: spacing(3), flexWrap: 'wrap' }}>
            {[
              '1. Connect your EV manufacturer account',
              '2. Set your charging preferences',
              '3. Earn rewards while we optimize your charging'
            ].map((step) => (
              <Box
                key={step}
                sx={{
                  flex: '1 1 200px',
                  maxWidth: '250px',
                  p: spacing(2),
                  backgroundColor: kaluzaColors.additionalColors.white,
                  border: `2px solid ${kaluzaColors.envyColors[200]}`,
                  borderRadius: '0.5rem'
                }}
              >
                <Typography
                  sx={{
                    fontSize: SizeVariation.x05,
                    color: kaluzaColors.colorRoles.textPrimary
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/signup')}
          sx={{
            backgroundColor: kaluzaColors.envyColors[500],
            color: kaluzaColors.additionalColors.white,
            px: spacing(6),
            py: spacing(2),
            fontSize: SizeVariation.x06,
            fontWeight: 500,
            borderRadius: '2rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: kaluzaColors.envyColors[600]
            }
          }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}

export default LandingPage;
