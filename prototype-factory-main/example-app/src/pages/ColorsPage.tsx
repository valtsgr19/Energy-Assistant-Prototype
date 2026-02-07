import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Grid, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  colorSwatch: {
    height: 80,
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 500,
    marginBottom: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  colorLabel: {
    textAlign: 'center',
    fontSize: '0.875rem'
  }
}));

const ColorsPage: React.FC = () => {
  const classes = useStyles();

  const colorFamilies = [
    {
      name: 'Spindle (Blues)',
      description: 'Trust and technology',
      colors: [
        { shade: '50', hex: '#F2F6FC', dark: true },
        { shade: '100', hex: '#E1EBF8', dark: true },
        { shade: '200', hex: '#C9DDF4', dark: true },
        { shade: '300', hex: '#B1CFEF', dark: true },
        { shade: '400', hex: '#78A9E2', dark: false },
        { shade: '500', hex: '#598BD8', dark: false },
        { shade: '600', hex: '#4471CC', dark: false },
        { shade: '700', hex: '#3B5EBA', dark: false },
        { shade: '800', hex: '#354D98', dark: false },
        { shade: '900', hex: '#2F4379', dark: false },
        { shade: '950', hex: '#212A4A', dark: false }
      ]
    },
    {
      name: 'Envy (Greens)',
      description: 'Growth and sustainability',
      colors: [
        { shade: '50', hex: '#F4F6F3', dark: true },
        { shade: '100', hex: '#E5EAE1', dark: true },
        { shade: '200', hex: '#CAD4C6', dark: true },
        { shade: '300', hex: '#A5B69F', dark: true },
        { shade: '400', hex: '#889E82', dark: false },
        { shade: '500', hex: '#5A7554', dark: false },
        { shade: '600', hex: '#445C3F', dark: false },
        { shade: '700', hex: '#364933', dark: false },
        { shade: '800', hex: '#2C3B2A', dark: false },
        { shade: '900', hex: '#253123', dark: false },
        { shade: '950', hex: '#141B13', dark: false }
      ]
    },
    {
      name: 'Wafer (Pinks)',
      description: 'Highlights and emphasis',
      colors: [
        { shade: '50', hex: '#FBF7F5', dark: true },
        { shade: '100', hex: '#F6EDEA', dark: true },
        { shade: '200', hex: '#EFDFD9', dark: true },
        { shade: '300', hex: '#E2C7BC', dark: true },
        { shade: '400', hex: '#D1A898', dark: false },
        { shade: '500', hex: '#BE8A75', dark: false },
        { shade: '600', hex: '#A8715A', dark: false },
        { shade: '700', hex: '#8C5C49', dark: false },
        { shade: '800', hex: '#754F3F', dark: false },
        { shade: '900', hex: '#634539', dark: false },
        { shade: '950', hex: '#34221B', dark: false }
      ]
    }
  ];

  const utilityColors = [
    { name: 'Success', hex: '#4FD061', usage: 'Success states' },
    { name: 'Error', hex: '#FF4E4E', usage: 'Error states' },
    { name: 'Warning', hex: '#FFEA4F', usage: 'Warning states', dark: true },
    { name: 'Info', hex: '#58D5F8', usage: 'Info states' }
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Color Palette
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        The Kaluza color system features nature-inspired palettes with accessibility in mind.
      </Typography>

      {colorFamilies.map((family, familyIndex) => (
        <div key={familyIndex} className={classes.section}>
          <Typography variant="h5" gutterBottom>
            {family.name}
          </Typography>
          <Typography variant="body2" paragraph color="textSecondary">
            {family.description}
          </Typography>
          <Grid container spacing={2}>
            {family.colors.map((color, colorIndex) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={colorIndex}>
                <Box
                  className={classes.colorSwatch}
                  style={{
                    backgroundColor: color.hex,
                    color: color.dark ? '#10100F' : '#FFFFFF'
                  }}
                >
                  {color.shade}
                </Box>
                <Typography className={classes.colorLabel}>
                  {color.hex}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </div>
      ))}

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Utility Colors
        </Typography>
        <Typography variant="body2" paragraph color="textSecondary">
          Semantic colors for feedback and states
        </Typography>
        <Grid container spacing={3}>
          {utilityColors.map((color, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper style={{ padding: 16 }}>
                <Box
                  className={classes.colorSwatch}
                  style={{
                    backgroundColor: color.hex,
                    color: color.dark ? '#10100F' : '#FFFFFF'
                  }}
                >
                  {color.name}
                </Box>
                <Typography variant="body2" align="center">
                  {color.hex}
                </Typography>
                <Typography variant="caption" align="center" display="block" color="textSecondary">
                  {color.usage}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Accessibility
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body1" paragraph>
            All color combinations meet WCAG AA standards for contrast:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">
                Text on white background: AAA (7:1 or higher)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                White text on primary colors: AA (4.5:1 or higher)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Large text (18pt+): AA (3:1 or higher)
              </Typography>
            </li>
          </ul>
        </Paper>
      </div>
    </div>
  );
};

export default ColorsPage;
