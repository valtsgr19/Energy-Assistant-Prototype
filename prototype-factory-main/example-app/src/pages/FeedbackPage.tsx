import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Button,
  Grid
} from '@material-ui/core';
import { Alert, Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  example: {
    padding: theme.spacing(3)
  }
}));

const FeedbackPage: React.FC = () => {
  const classes = useStyles();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Feedback
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Feedback components provide information about app processes and user actions.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Alerts
        </Typography>
        <Paper className={classes.example}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="success">
                This is a success alert — check it out!
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                This is an info alert — check it out!
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                This is a warning alert — check it out!
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="error">
                This is an error alert — check it out!
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => {}}>
                This alert has a close button!
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Progress Indicators
        </Typography>
        <Paper className={classes.example}>
          <Typography variant="h6" gutterBottom>
            Circular Progress
          </Typography>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <CircularProgress />
            <CircularProgress color="secondary" />
            <CircularProgress size={60} />
            <CircularProgress size={30} />
          </div>

          <Typography variant="h6" gutterBottom>
            Linear Progress
          </Typography>
          <div style={{ marginBottom: 16 }}>
            <LinearProgress />
          </div>
          <div style={{ marginBottom: 16 }}>
            <LinearProgress color="secondary" />
          </div>
          <div>
            <LinearProgress variant="determinate" value={50} />
          </div>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Snackbar
        </Typography>
        <Paper className={classes.example}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSnackbarOpen(true)}
            style={{ borderRadius: '2rem', textTransform: 'uppercase' }}
          >
            Show Snackbar
          </Button>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            message="This is a snackbar message"
          />
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Skeleton Loaders
        </Typography>
        <Paper className={classes.example}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rect" height={118} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="circle" width={40} height={40} />
            </Grid>
          </Grid>
        </Paper>
      </div>
    </div>
  );
};

export default FeedbackPage;
