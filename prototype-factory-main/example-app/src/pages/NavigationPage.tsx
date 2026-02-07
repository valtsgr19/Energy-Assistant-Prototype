import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  Stepper,
  Step,
  StepLabel
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  example: {
    padding: theme.spacing(3)
  }
}));

const NavigationPage: React.FC = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = React.useState(0);
  const [bottomNavValue, setBottomNavValue] = React.useState(0);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Navigation
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Navigation components help users move through your application.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Breadcrumbs
        </Typography>
        <Paper className={classes.example}>
          <Breadcrumbs>
            <Link color="inherit" href="#">
              Home
            </Link>
            <Link color="inherit" href="#">
              Category
            </Link>
            <Typography color="textPrimary">Current Page</Typography>
          </Breadcrumbs>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Tabs
        </Typography>
        <Paper>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Tab One" />
            <Tab label="Tab Two" />
            <Tab label="Tab Three" />
          </Tabs>
          <div style={{ padding: 24 }}>
            <Typography>Content for tab {tabValue + 1}</Typography>
          </div>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Bottom Navigation
        </Typography>
        <Paper>
          <BottomNavigation
            value={bottomNavValue}
            onChange={(e, newValue) => setBottomNavValue(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
            <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} />
          </BottomNavigation>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Stepper
        </Typography>
        <Paper className={classes.example}>
          <Stepper activeStep={1}>
            <Step>
              <StepLabel>Select campaign settings</StepLabel>
            </Step>
            <Step>
              <StepLabel>Create an ad group</StepLabel>
            </Step>
            <Step>
              <StepLabel>Create an ad</StepLabel>
            </Step>
          </Stepper>
        </Paper>
      </div>
    </div>
  );
};

export default NavigationPage;
