import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button, IconButton, Fab, ButtonGroup, Grid } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import FavoriteIcon from '@material-ui/icons/Favorite';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  example: {
    padding: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    alignItems: 'center'
  },
  button: {
    textTransform: 'uppercase',
    borderRadius: '2rem',
    letterSpacing: '0.09rem'
  }
}));

const ButtonsPage: React.FC = () => {
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Buttons
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Buttons allow users to take actions with a single tap.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Contained Buttons
        </Typography>
        <Paper className={classes.example}>
          <Button variant="contained" color="primary" className={classes.button}>
            Primary
          </Button>
          <Button variant="contained" color="secondary" className={classes.button}>
            Secondary
          </Button>
          <Button variant="contained" className={classes.button}>
            Default
          </Button>
          <Button variant="contained" color="primary" disabled className={classes.button}>
            Disabled
          </Button>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Outlined Buttons
        </Typography>
        <Paper className={classes.example}>
          <Button variant="outlined" color="primary" className={classes.button}>
            Primary
          </Button>
          <Button variant="outlined" color="secondary" className={classes.button}>
            Secondary
          </Button>
          <Button variant="outlined" className={classes.button}>
            Default
          </Button>
          <Button variant="outlined" color="primary" disabled className={classes.button}>
            Disabled
          </Button>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Text Buttons
        </Typography>
        <Paper className={classes.example}>
          <Button color="primary">
            Primary
          </Button>
          <Button color="secondary">
            Secondary
          </Button>
          <Button>
            Default
          </Button>
          <Button color="primary" disabled>
            Disabled
          </Button>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Buttons with Icons
        </Typography>
        <Paper className={classes.example}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className={classes.button}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveIcon />}
            className={classes.button}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<EditIcon />}
            className={classes.button}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<DeleteIcon />}
            className={classes.button}
          >
            Delete
          </Button>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Icon Buttons
        </Typography>
        <Paper className={classes.example}>
          <IconButton color="primary">
            <AddIcon />
          </IconButton>
          <IconButton color="secondary">
            <FavoriteIcon />
          </IconButton>
          <IconButton>
            <EditIcon />
          </IconButton>
          <IconButton disabled>
            <DeleteIcon />
          </IconButton>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Floating Action Buttons
        </Typography>
        <Paper className={classes.example}>
          <Fab color="primary">
            <AddIcon />
          </Fab>
          <Fab color="secondary">
            <EditIcon />
          </Fab>
          <Fab size="small" color="primary">
            <AddIcon />
          </Fab>
          <Fab disabled>
            <DeleteIcon />
          </Fab>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Button Sizes
        </Typography>
        <Paper className={classes.example}>
          <Button variant="contained" color="primary" size="small" className={classes.button}>
            Small
          </Button>
          <Button variant="contained" color="primary" size="medium" className={classes.button}>
            Medium
          </Button>
          <Button variant="contained" color="primary" size="large" className={classes.button}>
            Large
          </Button>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Button Groups
        </Typography>
        <Paper className={classes.example}>
          <ButtonGroup variant="contained" color="primary">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
          <ButtonGroup variant="outlined" color="primary">
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Full Width Buttons
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                className={classes.button}
              >
                Full Width Primary
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                className={classes.button}
              >
                Full Width Outlined
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Usage Guidelines
        </Typography>
        <Paper style={{ padding: 24 }}>
          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" paragraph>
                Use contained buttons for primary actions
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Use outlined buttons for secondary actions
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Use text buttons for tertiary or less important actions
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Limit to one primary button per screen
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                Use clear, action-oriented labels (e.g., "Save", "Delete", "Submit")
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Ensure buttons have a minimum touch target of 44x44px on mobile
              </Typography>
            </li>
          </ul>
        </Paper>
      </div>
    </div>
  );
};

export default ButtonsPage;
