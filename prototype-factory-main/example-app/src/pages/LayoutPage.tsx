import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Grid, Box, Divider } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  gridItem: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
    textAlign: 'center',
    borderRadius: theme.spacing(1)
  },
  spacingExample: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(2)
  }
}));

const LayoutPage: React.FC = () => {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Layout
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Layout components and spacing system for organizing content.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Grid System
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="h6" gutterBottom>
            12-Column Grid
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className={classes.gridItem}>xs=12</div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.gridItem}>xs=6</div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.gridItem}>xs=6</div>
            </Grid>
            <Grid item xs={4}>
              <div className={classes.gridItem}>xs=4</div>
            </Grid>
            <Grid item xs={4}>
              <div className={classes.gridItem}>xs=4</div>
            </Grid>
            <Grid item xs={4}>
              <div className={classes.gridItem}>xs=4</div>
            </Grid>
            <Grid item xs={3}>
              <div className={classes.gridItem}>xs=3</div>
            </Grid>
            <Grid item xs={3}>
              <div className={classes.gridItem}>xs=3</div>
            </Grid>
            <Grid item xs={3}>
              <div className={classes.gridItem}>xs=3</div>
            </Grid>
            <Grid item xs={3}>
              <div className={classes.gridItem}>xs=3</div>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Responsive Grid
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body2" paragraph color="textSecondary">
            Resize your browser to see the responsive behavior
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <div className={classes.gridItem}>
                xs=12 sm=6 md=4
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <div className={classes.gridItem}>
                xs=12 sm=6 md=4
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <div className={classes.gridItem}>
                xs=12 sm=6 md=4
              </div>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Spacing System
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body2" paragraph color="textSecondary">
            8px base unit: 1x = 8px, 2x = 16px, 3x = 24px, 4x = 32px
          </Typography>
          <Box className={classes.spacingExample} p={1}>
            Padding: 1 (8px)
          </Box>
          <Box className={classes.spacingExample} p={2}>
            Padding: 2 (16px)
          </Box>
          <Box className={classes.spacingExample} p={3}>
            Padding: 3 (24px)
          </Box>
          <Box className={classes.spacingExample} p={4}>
            Padding: 4 (32px)
          </Box>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Dividers
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body1">Content above divider</Typography>
          <Divider style={{ margin: '16px 0' }} />
          <Typography variant="body1">Content below divider</Typography>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Breakpoints
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="body2" paragraph>
            <strong>xs:</strong> 0px - Extra small (mobile)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>sm:</strong> 480px - Small (mobile landscape)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>md:</strong> 768px - Medium (tablet)
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>lg:</strong> 1280px - Large (desktop)
          </Typography>
          <Typography variant="body2">
            <strong>xl:</strong> 1920px - Extra large (large desktop)
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default LayoutPage;
