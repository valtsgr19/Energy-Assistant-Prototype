import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Grid, Chip } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: '#FFFFFF',
    borderRadius: theme.spacing(1)
  },
  section: {
    marginBottom: theme.spacing(4)
  },
  featureCard: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    color: theme.palette.success.main
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2)
  }
}));

const HomePage: React.FC = () => {
  const classes = useStyles();

  const features = [
    {
      title: 'Mobile-First',
      description: 'Responsive design optimized for all screen sizes'
    },
    {
      title: 'Accessible',
      description: 'WCAG AA compliant components'
    },
    {
      title: 'Customizable',
      description: 'Easy to theme and extend'
    },
    {
      title: 'Production Ready',
      description: 'Battle-tested components'
    }
  ];

  const components = [
    'Buttons', 'Forms', 'Cards', 'Tables', 'Alerts', 'Modals',
    'Drawers', 'Tooltips', 'Breadcrumbs', 'Chips', 'Avatars',
    'Progress', 'Skeletons', 'Switches', 'Checkboxes', 'Radios'
  ];

  return (
    <div>
      <Paper className={classes.hero} elevation={0}>
        <Typography variant="h3" gutterBottom>
          Kaluza Prototype Starter Kit
        </Typography>
        <Typography variant="h6">
          A mobile-friendly component library built with React and Material-UI (using inspiration from Kaluza Flex Control Room)
        </Typography>
      </Paper>

      <div className={classes.section}>
        <Typography variant="h4" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper className={classes.featureCard}>
                <CheckCircleIcon className={classes.icon} />
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>

      <div className={classes.section}>
        <Typography variant="h4" gutterBottom>
          Components
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body1" paragraph>
            This showcase includes {components.length}+ components from the Kaluza design system.
            Use the menu to explore each component category.
          </Typography>
          <div className={classes.chipContainer}>
            {components.map((component, index) => (
              <Chip key={index} label={component} color="primary" />
            ))}
          </div>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h4" gutterBottom>
          Getting Started
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body1" paragraph>
            1. Browse the components using the menu
          </Typography>
          <Typography variant="body1" paragraph>
            2. View live examples and code snippets
          </Typography>
          <Typography variant="body1" paragraph>
            3. Copy the code and use in your project
          </Typography>
          <Typography variant="body1">
            4. Customize the theme to match your brand
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default HomePage;
