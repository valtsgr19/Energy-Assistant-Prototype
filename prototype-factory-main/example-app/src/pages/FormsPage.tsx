import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Button,
  Grid
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(4)
  },
  example: {
    padding: theme.spacing(3)
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: 200
  }
}));

const FormsPage: React.FC = () => {
  const classes = useStyles();
  const [textValue, setTextValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(30);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Forms
      </Typography>
      <Typography variant="body1" paragraph color="textSecondary">
        Form components for user input and data collection.
      </Typography>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Text Fields
        </Typography>
        <Paper className={classes.example}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Standard"
                variant="outlined"
                fullWidth
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Filled"
                variant="filled"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="With Helper Text"
                variant="outlined"
                fullWidth
                helperText="This is helper text"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Error State"
                variant="outlined"
                fullWidth
                error
                helperText="This field has an error"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Disabled"
                variant="outlined"
                fullWidth
                disabled
                value="Disabled field"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Multiline"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                placeholder="Enter multiple lines of text..."
              />
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Select Dropdowns
        </Typography>
        <Paper className={classes.example}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Select Option</InputLabel>
                <Select
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value as string)}
                  label="Select Option"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="option1">Option 1</MenuItem>
                  <MenuItem value="option2">Option 2</MenuItem>
                  <MenuItem value="option3">Option 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl variant="filled" fullWidth>
                <InputLabel>Filled Select</InputLabel>
                <Select label="Filled Select">
                  <MenuItem value="a">Choice A</MenuItem>
                  <MenuItem value="b">Choice B</MenuItem>
                  <MenuItem value="c">Choice C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Checkboxes
        </Typography>
        <Paper className={classes.example}>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                color="primary"
              />
            }
            label="Primary Checkbox"
          />
          <FormControlLabel
            control={<Checkbox color="secondary" />}
            label="Secondary Checkbox"
          />
          <FormControlLabel
            control={<Checkbox disabled />}
            label="Disabled Checkbox"
          />
          <FormControlLabel
            control={<Checkbox checked disabled />}
            label="Disabled Checked"
          />
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Radio Buttons
        </Typography>
        <Paper className={classes.example}>
          <RadioGroup value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
            <FormControlLabel value="option1" control={<Radio color="primary" />} label="Option 1" />
            <FormControlLabel value="option2" control={<Radio color="primary" />} label="Option 2" />
            <FormControlLabel value="option3" control={<Radio color="primary" />} label="Option 3" />
            <FormControlLabel value="option4" control={<Radio disabled />} label="Disabled" />
          </RadioGroup>
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Switches
        </Typography>
        <Paper className={classes.example}>
          <FormControlLabel
            control={
              <Switch
                checked={switchValue}
                onChange={(e) => setSwitchValue(e.target.checked)}
                color="primary"
              />
            }
            label="Primary Switch"
          />
          <FormControlLabel
            control={<Switch color="secondary" />}
            label="Secondary Switch"
          />
          <FormControlLabel
            control={<Switch disabled />}
            label="Disabled Switch"
          />
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Sliders
        </Typography>
        <Paper className={classes.example}>
          <Typography gutterBottom>
            Value: {sliderValue}
          </Typography>
          <Slider
            value={sliderValue}
            onChange={(e, value) => setSliderValue(value as number)}
            color="primary"
          />
          <Typography gutterBottom style={{ marginTop: 24 }}>
            Disabled Slider
          </Typography>
          <Slider disabled value={50} />
        </Paper>
      </div>

      <div className={classes.section}>
        <Typography variant="h5" gutterBottom>
          Complete Form Example
        </Typography>
        <Paper className={classes.example}>
          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select label="Country">
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="uk">United Kingdom</MenuItem>
                    <MenuItem value="ca">Canada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="I agree to the terms and conditions"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" style={{ borderRadius: '2rem', textTransform: 'uppercase' }}>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default FormsPage;
